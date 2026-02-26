#!/usr/bin/env python3
"""
Generate quiz JSON data from sumo-scrape CSV files.

Downloads bout results and shikona mappings from the sumo-scrape repository,
then produces per-basho quiz JSON files and an index.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import requests

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

FACT_BOUT_DAILY_URL = (
    "https://raw.githubusercontent.com/gghatano/sumo-scrape/main/"
    "data/fact/fact_bout_daily.csv"
)
DIM_SHIKONA_URL = (
    "https://raw.githubusercontent.com/gghatano/sumo-scrape/main/"
    "data/dim/dim_shikona_by_basho.csv"
)

USER_AGENT = "sumo-winner-quiz/1.0"

# Number of basho in 2 years (6 basho/year)
DEFAULT_BASHO_COUNT = 12


# ---------------------------------------------------------------------------
# HTTP / CSV helpers
# ---------------------------------------------------------------------------

def download_csv(url: str) -> list[dict[str, str]]:
    """Download a CSV file and return rows as list of dicts."""
    logger.info("Downloading %s", url)
    headers = {"User-Agent": USER_AGENT}
    resp = requests.get(url, headers=headers, timeout=60)
    resp.raise_for_status()
    resp.encoding = "utf-8"
    reader = csv.DictReader(io.StringIO(resp.text))
    return list(reader)


def load_csv(filepath: Path) -> list[dict[str, str]]:
    """Load a local CSV file and return rows as list of dicts."""
    logger.info("Loading %s", filepath)
    with open(filepath, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


# ---------------------------------------------------------------------------
# Label generation (matches fetch_torikumi.py)
# ---------------------------------------------------------------------------

def basho_id_to_label(basho_id: str) -> str:
    """Convert a basho ID like '202601' to '2026年1月場所'."""
    year = basho_id[:4]
    month = str(int(basho_id[4:6]))  # strip leading zero
    return f"{year}年{month}月場所"


# ---------------------------------------------------------------------------
# JSON output (matches fetch_torikumi.py)
# ---------------------------------------------------------------------------

def save_json(data: dict | list, filepath: Path) -> None:
    """Save data as a JSON file, creating directories as needed."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    logger.info("Saved %s", filepath)


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def build_shikona_map(
    dim_rows: list[dict[str, str]],
) -> dict[tuple[str, str], str]:
    """Build (basho, rid) -> shikona_at_basho mapping."""
    mapping: dict[tuple[str, str], str] = {}
    for row in dim_rows:
        key = (row["basho"], row["rid"])
        mapping[key] = row["shikona_at_basho"]
    return mapping


def filter_makuuchi_regular(
    bout_rows: list[dict[str, str]],
) -> list[dict[str, str]]:
    """Filter to Makuuchi division, regular bouts only."""
    return [
        row for row in bout_rows
        if row.get("division") == "Makuuchi" and row.get("is_regular") == "T"
    ]


def compute_since_basho(all_basho_ids: list[str], count: int) -> str:
    """Return the basho ID that is `count` basho back from the latest."""
    sorted_ids = sorted(set(all_basho_ids))
    if len(sorted_ids) <= count:
        return sorted_ids[0]
    return sorted_ids[-count]


def generate_quiz_data(
    bout_rows: list[dict[str, str]],
    shikona_map: dict[tuple[str, str], str],
    since: str | None = None,
) -> dict[str, dict]:
    """Generate quiz data grouped by basho and day.

    Returns {basho_id: {"basho": {...}, "days": {day: [bouts]}}}
    """
    # Filter
    filtered = filter_makuuchi_regular(bout_rows)
    logger.info(
        "Filtered to %d Makuuchi regular bouts (from %d total)",
        len(filtered),
        len(bout_rows),
    )

    # Determine since threshold
    all_basho_ids = sorted(set(row["basho"] for row in filtered))
    if since is None:
        since = compute_since_basho(all_basho_ids, DEFAULT_BASHO_COUNT)
    logger.info("Including basho >= %s", since)

    # Group by basho and day
    basho_data: dict[str, dict[str, list]] = {}
    skipped = 0

    for row in filtered:
        basho = row["basho"]
        if basho < since:
            continue

        day = str(int(row["day"]))  # normalize "01" -> "1"
        east_rid = row["east_rid"]
        west_rid = row["west_rid"]

        east_name = shikona_map.get((basho, east_rid))
        west_name = shikona_map.get((basho, west_rid))

        if east_name is None or west_name is None:
            skipped += 1
            continue

        if basho not in basho_data:
            basho_data[basho] = {}
        if day not in basho_data[basho]:
            basho_data[basho][day] = []

        basho_data[basho][day].append({
            "east": east_name,
            "west": west_name,
            "winner": row["winner_side"],
            "kimarite": row["kimarite"],
        })

    if skipped > 0:
        logger.warning("Skipped %d bouts due to missing shikona mapping", skipped)

    # Build structured output
    result: dict[str, dict] = {}
    for basho_id in sorted(basho_data.keys()):
        days = basho_data[basho_id]
        # Sort days numerically, sort bouts within each day by original order
        sorted_days = {
            str(d): days[str(d)]
            for d in sorted(int(k) for k in days.keys())
        }
        result[basho_id] = {
            "basho": {
                "id": basho_id,
                "label": basho_id_to_label(basho_id),
            },
            "days": sorted_days,
        }

    return result


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate quiz JSON data from sumo-scrape CSV files"
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default="public/data/quiz",
        help="Output directory (default: public/data/quiz)",
    )
    parser.add_argument(
        "--csv-dir",
        type=str,
        default=None,
        help="Local directory containing CSV files (skip download)",
    )
    parser.add_argument(
        "--since",
        type=str,
        default=None,
        help="Include basho >= this ID (e.g. 202301). Default: latest 12 basho.",
    )
    args = parser.parse_args()

    output_dir = Path(args.output_dir)

    # Load CSV data
    if args.csv_dir:
        csv_dir = Path(args.csv_dir)
        bout_rows = load_csv(csv_dir / "fact_bout_daily.csv")
        dim_rows = load_csv(csv_dir / "dim_shikona_by_basho.csv")
    else:
        bout_rows = download_csv(FACT_BOUT_DAILY_URL)
        dim_rows = download_csv(DIM_SHIKONA_URL)

    logger.info("Loaded %d bout rows, %d shikona rows", len(bout_rows), len(dim_rows))

    # Build shikona mapping
    shikona_map = build_shikona_map(dim_rows)
    logger.info("Built shikona map with %d entries", len(shikona_map))

    # Generate quiz data
    quiz_data = generate_quiz_data(bout_rows, shikona_map, since=args.since)
    logger.info("Generated quiz data for %d basho", len(quiz_data))

    if not quiz_data:
        logger.error("No quiz data generated")
        sys.exit(1)

    # Save per-basho JSON files
    for basho_id, data in quiz_data.items():
        filepath = output_dir / f"{basho_id}.json"
        save_json(data, filepath)

    # Save index.json (newest first)
    basho_list = [
        {"id": basho_id, "label": basho_id_to_label(basho_id)}
        for basho_id in sorted(quiz_data.keys(), reverse=True)
    ]
    index_data = {"bashoList": basho_list}
    save_json(index_data, output_dir / "index.json")

    logger.info("完了: %d 場所分のクイズデータを生成しました", len(quiz_data))


if __name__ == "__main__":
    main()
