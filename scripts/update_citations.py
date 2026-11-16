"""Update the citation numbers in content.js from the public Google Scholar profile,
and the monthly citation counts from OpenAlex.

Usage: python3 scripts/update_citations.py
Exits with an error (and changes nothing) if the profile page cannot be read or parsed,
for example when Google Scholar answers with a CAPTCHA page.
Google Scholar only reports citations per year. For the monthly chart, OpenAlex lists the
papers that cite each publication with their publication date; they are counted per month.
If OpenAlex cannot be read, the monthly counts already in content.js are kept.
"""
import datetime
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content.js"
INDEX = ROOT / "index.html"


def scholar_url() -> str:
    m = re.search(r'scholar:\s*"(https://scholar\.google\.com/citations\?user=[\w-]+)"', CONTENT.read_text())
    if not m:
        sys.exit("No Google Scholar URL found in content.js (links.scholar).")
    return m.group(1) + "&hl=en"


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (personal website citation update; once a week)",
        "Accept-Language": "en",
    })
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def parse(html: str) -> dict:
    # Stats table: Citations, h-index, i10-index; each row has "All" then "Since <year>".
    stats = [int(x) for x in re.findall(r'<td class="gsc_rsb_std">(\d+)</td>', html)]
    if len(stats) < 6:
        raise ValueError("citation table not found (CAPTCHA or changed page layout?)")
    total, h_index, i10 = stats[0], stats[2], stats[4]

    # Per-year bars. Years are listed left to right; each bar's z-index counts from the right (1 = latest year).
    years = [int(y) for y in re.findall(r'<span class="gsc_g_t"[^>]*>(\d{4})</span>', html)]
    by_year = {y: 0 for y in years}
    for z, n in re.findall(r'<a[^>]*class="gsc_g_a"[^>]*z-index:(\d+)[^>]*>\s*<span class="gsc_g_al">(\d+)</span>', html):
        by_year[years[len(years) - int(z)]] = int(n)
    if not years:
        raise ValueError("per-year citation chart not found")
    return {"total": total, "hIndex": h_index, "i10": i10, "byYear": by_year}


def openalex_by_month() -> dict:
    """Citing papers per month (YYYY-MM), summed over all publications in content.js, like Scholar's total."""
    dois = re.findall(r'doi: "([^"]+)"', CONTENT.read_text())
    months: dict = {}
    for doi in dois:
        work = json.loads(fetch("https://api.openalex.org/works/doi:" + urllib.parse.quote(doi)))
        wid = work["id"].rsplit("/", 1)[-1]
        cursor = "*"
        while cursor:
            page = json.loads(fetch(f"https://api.openalex.org/works?filter=cites:{wid}&select=publication_date&per-page=200&cursor={cursor}"))
            for r in page["results"]:
                if r.get("publication_date"):
                    m = r["publication_date"][:7]
                    months[m] = months.get(m, 0) + 1
            cursor = page["meta"].get("next_cursor") if page["results"] else None
    return dict(sorted(months.items()))


def write(c: dict) -> None:
    as_of = datetime.date.today().strftime("%-d %b %Y")
    by_year = ", ".join(f"{y}: {n}" for y, n in sorted(c["byYear"].items()) if n > 0)
    text = CONTENT.read_text()
    if c.get("byMonth") is not None:
        by_month = "    byMonth: { " + ", ".join(f'"{m}": {n}' for m, n in c["byMonth"].items()) + " }, // OpenAlex, citing papers per publication month\n"
    else:  # OpenAlex failed: keep the previous line
        old = re.search(r"^    byMonth: .*\n", text, flags=re.M)
        by_month = old.group(0) if old else ""
    block = (
        "  citations: {\n"
        f'    asOf: "{as_of}", // shown only in llms.txt\n'
        f'    total: {c["total"]}, hIndex: {c["hIndex"]}, i10: {c["i10"]},\n'
        f"    byYear: {{ {by_year} }},\n"
        + by_month +
        "  },"
    )
    new, n = re.subn(r"  citations: \{\n.*?\n  \},", block, text, count=1, flags=re.S)
    if n != 1:
        sys.exit("Could not find the citations block in content.js.")
    CONTENT.write_text(new)

    # Bump ?v=N on the asset links so browsers load the new files.
    idx = INDEX.read_text()
    INDEX.write_text(re.sub(r"\?v=(\d+)", lambda m: f"?v={int(m.group(1)) + 1}", idx))


if __name__ == "__main__":
    try:
        data = parse(fetch(scholar_url()))
    except Exception as e:  # network error, CAPTCHA, layout change
        sys.exit(f"Google Scholar update failed: {e}")
    try:
        data["byMonth"] = openalex_by_month()
    except Exception as e:
        print(f"OpenAlex monthly counts failed, keeping the old ones: {e}", file=sys.stderr)
    print(json.dumps(data))
    write(data)
