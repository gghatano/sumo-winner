#!/usr/bin/env python3
"""
Scraper for Yahoo! Sports Navi sumo torikumi (match) data.

Fetches torikumi data from Yahoo! Sports Navi and outputs JSON files.
"""

from __future__ import annotations

import argparse
import json
import logging
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

BASE_URL = "https://sports.yahoo.co.jp/sumo/torikumi"
USER_AGENT = "sumo-predict-bot/1.0 (+https://github.com/owner/sumo-predict)"
MAX_RETRIES = 3
RETRY_DELAYS = [1, 2, 4]  # exponential backoff


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def fetch_page(url: str) -> str | None:
    """Fetch a page with retries and exponential backoff.

    Returns the HTML text on success, or None on failure.
    """
    headers = {"User-Agent": USER_AGENT}
    for attempt in range(MAX_RETRIES):
        try:
            resp = requests.get(url, headers=headers, timeout=30)
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as exc:
            logger.warning(
                "Attempt %d/%d failed for %s: %s",
                attempt + 1,
                MAX_RETRIES,
                url,
                exc,
            )
            if attempt < MAX_RETRIES - 1:
                time.sleep(RETRY_DELAYS[attempt])
    logger.error("All %d attempts failed for %s", MAX_RETRIES, url)
    return None


# ---------------------------------------------------------------------------
# Parser functions (testable)
# ---------------------------------------------------------------------------

def parse_top_page(html: str) -> tuple[str | None, int | None]:
    """Parse the top page to extract the latest basho ID and day.

    Returns (basho_id, day) or (None, None) if detection fails.

    Strategy:
      1. Look for links matching /sumo/torikumi/{YYYYMM}/{day}
      2. Fall back to text patterns like "202601" and "N日目"
    """
    soup = BeautifulSoup(html, "html.parser")

    basho_id: str | None = None
    day: int | None = None

    # Strategy 1: scan <a> href attributes
    link_pattern = re.compile(r"/sumo/torikumi/(\d{6})/(\d{1,2})")
    for tag in soup.find_all("a", href=True):
        m = link_pattern.search(tag["href"])
        if m:
            candidate_basho = m.group(1)
            candidate_day = int(m.group(2))
            # Pick the latest basho and highest day
            if basho_id is None or candidate_basho > basho_id or (
                candidate_basho == basho_id and candidate_day > (day or 0)
            ):
                basho_id = candidate_basho
                day = candidate_day

    if basho_id and day:
        return basho_id, day

    # Strategy 2: regex over raw text
    text = soup.get_text()
    basho_match = re.search(r"(20\d{4})", text)
    day_match = re.search(r"(\d{1,2})\s*日目", text)
    if basho_match:
        basho_id = basho_match.group(1)
    if day_match:
        day = int(day_match.group(1))

    return basho_id, day


def parse_torikumi(html: str) -> list[dict[str, str]]:
    """Parse a torikumi page and extract makuuchi matches.

    Returns a list of dicts with 'east' and 'west' keys.

    Strategies (tried in order):
      1. Find a section headed "幕内" and parse <table> rows below it.
      2. Look for table rows with class hints (east/west).
      3. Generic table parsing: assume 1st and 3rd columns are wrestlers.
    """
    soup = BeautifulSoup(html, "html.parser")
    matches: list[dict[str, str]] = []

    # Strategy 1 & 2: Find the makuuchi section
    makuuchi_section = _find_makuuchi_section(soup)
    if makuuchi_section is not None:
        table = makuuchi_section.find("table")
        if table:
            matches = _parse_table(table)
            if matches:
                return matches

    # Strategy 3: Find all tables, look for one near a "幕内" text
    for heading in soup.find_all(re.compile(r"^h[1-6]$")):
        if "幕内" in heading.get_text():
            # Walk siblings to find the next table
            sibling = heading.find_next_sibling()
            while sibling:
                if sibling.name == "table":
                    matches = _parse_table(sibling)
                    if matches:
                        return matches
                    break
                # Also check if the table is nested inside a div sibling
                if sibling.name == "div":
                    inner_table = sibling.find("table")
                    if inner_table:
                        matches = _parse_table(inner_table)
                        if matches:
                            return matches
                sibling = sibling.find_next_sibling()

    # Strategy 4: last resort — scan all tables for east/west patterns
    for table in soup.find_all("table"):
        matches = _parse_table(table)
        if matches:
            return matches

    return matches


def _find_makuuchi_section(soup: BeautifulSoup):
    """Find the container element for the makuuchi section."""
    # Look for elements that contain "幕内" text
    for el in soup.find_all(string=re.compile("幕内")):
        parent = el.parent
        if parent is None:
            continue
        # Walk up to find a section-like container
        for _ in range(5):
            if parent is None:
                break
            # Check if this container has a <table> child
            if parent.find("table"):
                return parent
            parent = parent.parent
    return None


def _parse_table(table) -> list[dict[str, str]]:
    """Extract east/west wrestler pairs from a table element."""
    matches: list[dict[str, str]] = []
    rows = table.find_all("tr")

    for row in rows:
        cells = row.find_all("td")
        if not cells:
            continue

        east, west = _extract_pair_from_cells(cells)
        if east and west:
            matches.append({"east": east, "west": west})

    return matches


def _extract_pair_from_cells(cells) -> tuple[str, str]:
    """Try to extract an (east, west) pair from table cells.

    Approach A: cells with class containing 'east' / 'west'.
    Approach B: first and last text-containing cells (skip middle result cell).
    """
    east = ""
    west = ""

    # Approach A: class-based
    for cell in cells:
        classes = cell.get("class", [])
        class_str = " ".join(classes) if isinstance(classes, list) else str(classes)
        text = cell.get_text(strip=True)
        if "east" in class_str and text:
            east = text
        elif "west" in class_str and text:
            west = text

    if east and west:
        return east, west

    # Approach B: positional (first and last non-empty text cells)
    texts = [c.get_text(strip=True) for c in cells]
    non_empty = [(i, t) for i, t in enumerate(texts) if t and t != "-"]
    if len(non_empty) >= 2:
        east = non_empty[0][1]
        west = non_empty[-1][1]

    return east, west


# ---------------------------------------------------------------------------
# Label generation
# ---------------------------------------------------------------------------

def basho_id_to_label(basho_id: str) -> str:
    """Convert a basho ID like '202601' to '2026年1月場所'."""
    year = basho_id[:4]
    month = str(int(basho_id[4:6]))  # strip leading zero
    return f"{year}年{month}月場所"


# ---------------------------------------------------------------------------
# JSON output
# ---------------------------------------------------------------------------

def build_torikumi_json(
    basho_id: str,
    day: int,
    matches: list[dict[str, str]],
    source_url: str,
) -> dict:
    """Build the JSON structure for a single day's torikumi."""
    return {
        "source": source_url,
        "basho": {
            "id": basho_id,
            "label": basho_id_to_label(basho_id),
        },
        "day": day,
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "division": "makuuchi",
        "matches": matches,
    }


def save_json(data: dict, filepath: Path) -> None:
    """Save data as a JSON file, creating directories as needed."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info("Saved %s", filepath)


# ---------------------------------------------------------------------------
# Main logic
# ---------------------------------------------------------------------------

def fetch_and_save(
    basho_id: str,
    day: int,
    output_dir: Path,
) -> dict | None:
    """Fetch a single day's torikumi, parse it, and save JSON.

    Returns the JSON data dict on success, or None on failure.
    Does NOT overwrite existing files on failure.
    """
    url = f"{BASE_URL}/{basho_id}/{day}"
    html = fetch_page(url)
    if html is None:
        return None

    matches = parse_torikumi(html)
    if not matches:
        logger.warning("No matches extracted for %s day %d", basho_id, day)
        return None

    data = build_torikumi_json(basho_id, day, matches, url)
    filepath = output_dir / basho_id / f"{day}.json"
    save_json(data, filepath)
    return data


def detect_latest(html: str | None = None) -> tuple[str | None, int | None]:
    """Detect the latest basho and day from the top page.

    If html is None, fetches the top page first.
    """
    if html is None:
        html = fetch_page(f"{BASE_URL}/")
        if html is None:
            return None, None
    return parse_top_page(html)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch sumo torikumi data from Yahoo! Sports Navi"
    )
    parser.add_argument(
        "--basho",
        type=str,
        help="Basho ID (e.g. 202601). If omitted, detect latest.",
    )
    parser.add_argument(
        "--day",
        type=int,
        help="Day number (1-15). If omitted with --basho, fetch all days.",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="public/data/torikumi",
        help="Output directory (default: public/data/torikumi)",
    )
    args = parser.parse_args()
    output_dir = Path(args.output_dir)

    basho_id = args.basho
    day = args.day

    # Detect latest if needed
    if basho_id is None:
        basho_id, day = detect_latest()
        if basho_id is None:
            logger.error("Could not detect latest basho from top page")
            sys.exit(0)
        if day is None:
            day = 1
        logger.info("Detected latest: basho=%s day=%d", basho_id, day)

    # Determine days to fetch
    if day is not None:
        days = [day]
    else:
        days = list(range(1, 16))

    # Fetch and save
    latest_data: dict | None = None
    success_count = 0
    fail_count = 0
    for d in days:
        data = fetch_and_save(basho_id, d, output_dir)
        if data is not None:
            latest_data = data
            success_count += 1
        else:
            logger.warning("Day %d の取得に失敗", d)
            fail_count += 1

    # Update latest.json with the last successful result
    if latest_data is not None:
        save_json(latest_data, output_dir / "latest.json")

    if success_count == 0 and fail_count > 0:
        logger.error("全ての取得に失敗しました")
        sys.exit(1)

    logger.info("完了: 成功=%d, 失敗=%d", success_count, fail_count)
    sys.exit(0)


if __name__ == "__main__":
    main()
