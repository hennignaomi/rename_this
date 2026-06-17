from __future__ import annotations

from pathlib import Path

import geopandas as gpd
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
STREETS_PATH = ROOT / "processed_data" / "strassen_berlin.geojson"
OUT_25833 = ROOT / "processed_data" / "strassen_adressen_berlin.geojson"
OUT_4326 = ROOT / "processed_data" / "strassen_adressen_berlin_wgs84.geojson"

# Official Berlin address points WFS.
WFS_URL = (
    "https://gdi.berlin.de/services/wfs/adressen_berlin"
    "?service=WFS"
    "&version=2.0.0"
    "&request=GetFeature"
    "&typeNames=adressen_berlin:adressen_berlin"
    "&outputFormat=json"
    "&srsName=EPSG:25833"
    "&count=1000000"
)


def load_streets() -> gpd.GeoDataFrame:
    streets = gpd.read_file(STREETS_PATH)
    streets["strnr"] = streets["strnr"].astype(str).str.strip()
    return streets


def load_addresses() -> gpd.GeoDataFrame:
    addresses = gpd.read_file(WFS_URL)
    addresses["str_nr"] = addresses["str_nr"].astype(str).str.strip()
    return addresses


def build_export(streets: gpd.GeoDataFrame, addresses: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    valid_addresses = addresses.dropna(subset=["adressid", "str_nr", "str_name"]).copy()
    valid_addresses = valid_addresses[valid_addresses["str_nr"] != ""]

    address_counts = (
        valid_addresses.groupby("str_nr", as_index=False)
        .agg(
            STRANAM=("str_name", "first"),
            HSZ=("adressid", "nunique"),
        )
        .rename(columns={"str_nr": "STRASSE"})
    )

    export = streets.rename(
        columns={
            "strnr": "STRASSE",
            "strname": "street_name_source",
        }
    ).merge(address_counts, on="STRASSE", how="left")

    export["STRANAM"] = export["STRANAM"].fillna(export["street_name_source"])
    export["HSZ"] = export["HSZ"].fillna(0).astype(int)
    export["laenge"] = export.geometry.length.round(6)
    export["adressen_pro_100meter"] = (
        (export["HSZ"] / export["laenge"]) * 100
    ).fillna(0).round(6)

    export = export[
        [
            "STRASSE",
            "STRANAM",
            "HSZ",
            "laenge",
            "adressen_pro_100meter",
            "bezname",
            "n_bezirke",
            "strabtypname",
            "geometry",
        ]
    ]

    return gpd.GeoDataFrame(export, geometry="geometry", crs=streets.crs)


def main() -> None:
    streets = load_streets()
    addresses = load_addresses()
    export = build_export(streets, addresses)

    export.to_file(OUT_25833, driver="GeoJSON")
    export.to_crs(epsg=4326).to_file(OUT_4326, driver="GeoJSON")

    matched = int((export["HSZ"] > 0).sum())
    print(f"Loaded {len(streets):,} Berlin streets")
    print(f"Loaded {len(addresses):,} Berlin address points")
    print(f"Matched addresses to {matched:,} streets")
    print(f"Saved {OUT_25833.name}")
    print(f"Saved {OUT_4326.name}")


if __name__ == "__main__":
    main()
