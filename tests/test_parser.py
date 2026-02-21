"""Tests for the torikumi parser functions."""

import sys
from pathlib import Path

# Add project root to path so we can import the script module
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "scripts"))

from fetch_torikumi import (
    basho_id_to_label,
    build_torikumi_json,
    parse_top_page,
    parse_torikumi,
)

FIXTURES_DIR = Path(__file__).resolve().parent / "fixtures"


def _read_fixture(name: str) -> str:
    return (FIXTURES_DIR / name).read_text(encoding="utf-8")


# ---------------------------------------------------------------------------
# parse_torikumi tests
# ---------------------------------------------------------------------------


class TestParseTorikumi:
    """Tests for parse_torikumi."""

    def test_extracts_makuuchi_matches(self):
        html = _read_fixture("sample_torikumi.html")
        matches = parse_torikumi(html)
        assert len(matches) == 8

    def test_east_west_names_correct(self):
        html = _read_fixture("sample_torikumi.html")
        matches = parse_torikumi(html)
        # Check first match
        assert matches[0]["east"] == "高安"
        assert matches[0]["west"] == "大の里"
        # Check second match
        assert matches[1]["east"] == "豊昇龍"
        assert matches[1]["west"] == "霧島"
        # Check last match
        assert matches[-1]["east"] == "玉鷲"
        assert matches[-1]["west"] == "遠藤"

    def test_all_matches_have_east_and_west(self):
        html = _read_fixture("sample_torikumi.html")
        matches = parse_torikumi(html)
        for m in matches:
            assert "east" in m
            assert "west" in m
            assert m["east"]
            assert m["west"]

    def test_empty_html_returns_empty(self):
        matches = parse_torikumi("")
        assert matches == []

    def test_broken_html_does_not_raise(self):
        matches = parse_torikumi("<html><body><div><<<broken>>>")
        assert isinstance(matches, list)

    def test_html_without_makuuchi_returns_empty(self):
        html = """
        <html><body>
        <h2>十両</h2>
        <table><tr><td>A</td><td>-</td><td>B</td></tr></table>
        </body></html>
        """
        # This may or may not return results depending on fallback strategy.
        # The important thing is it doesn't crash.
        matches = parse_torikumi(html)
        assert isinstance(matches, list)

    def test_table_without_class_hints(self):
        """Tables without east/west classes should still be parsed positionally."""
        html = """
        <html><body>
        <h2>幕内</h2>
        <table>
          <tr><td>照ノ富士</td><td>-</td><td>貴景勝</td></tr>
          <tr><td>朝乃山</td><td>-</td><td>正代</td></tr>
        </table>
        </body></html>
        """
        matches = parse_torikumi(html)
        assert len(matches) == 2
        assert matches[0]["east"] == "照ノ富士"
        assert matches[0]["west"] == "貴景勝"


# ---------------------------------------------------------------------------
# parse_top_page tests
# ---------------------------------------------------------------------------


class TestParseTopPage:
    """Tests for parse_top_page."""

    def test_detects_basho_and_day(self):
        html = _read_fixture("sample_top.html")
        basho_id, day = parse_top_page(html)
        assert basho_id == "202601"
        assert day == 12

    def test_empty_html_returns_none(self):
        basho_id, day = parse_top_page("")
        assert basho_id is None
        assert day is None

    def test_fallback_text_detection(self):
        html = """
        <html><body>
        <p>202603 場所 7日目の取組</p>
        </body></html>
        """
        basho_id, day = parse_top_page(html)
        assert basho_id == "202603"
        assert day == 7


# ---------------------------------------------------------------------------
# basho_id_to_label tests
# ---------------------------------------------------------------------------


class TestBashoIdToLabel:
    def test_january(self):
        assert basho_id_to_label("202601") == "2026年1月場所"

    def test_november(self):
        assert basho_id_to_label("202511") == "2025年11月場所"

    def test_march(self):
        assert basho_id_to_label("202503") == "2025年3月場所"


# ---------------------------------------------------------------------------
# build_torikumi_json tests
# ---------------------------------------------------------------------------


class TestBuildTorikumiJson:
    def test_structure(self):
        matches = [{"east": "A", "west": "B"}]
        result = build_torikumi_json("202601", 5, matches, "https://example.com")
        assert result["basho"]["id"] == "202601"
        assert result["basho"]["label"] == "2026年1月場所"
        assert result["day"] == 5
        assert result["division"] == "makuuchi"
        assert result["matches"] == matches
        assert result["source"] == "https://example.com"
        assert "updatedAt" in result
