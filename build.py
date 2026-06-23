#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Usage:
    python build.py --version thunderbird
    python build.py --version browser --browser chrome
    python build.py --version browser --browser firefox
"""

import argparse
import os
import shutil
import zipfile
from pathlib import Path


def clean_output(out_dir: Path, zip_path: Path) -> None:
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    if zip_path.exists():
        zip_path.unlink()


def overlay(src_dir: Path, out_dir: Path) -> None:
    for src in src_dir.glob("*"):
        dest = out_dir / src.name
        if src.is_dir():
            shutil.copytree(src, dest, dirs_exist_ok=True)
        else:
            shutil.copy2(src, dest)


def zip_output(out_dir: Path, zip_path: Path) -> None:
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(out_dir):
            for file in files:
                file_path = Path(root) / file
                arcname = file_path.relative_to(out_dir)
                zf.write(file_path, arcname)


def build_thunderbird(src: Path, root: Path) -> None:
    out_dir = root / "dist" / "thunderbird"
    zip_path = root / "extension-thunderbird.zip"

    print("Building Thunderbird extension...")

    clean_output(out_dir, zip_path)
    overlay(src / "shared", out_dir)
    overlay(src / "thunderbird", out_dir)
    zip_output(out_dir, zip_path)

    size_kb = zip_path.stat().st_size / 1024
    print(f"Built {zip_path} – {size_kb:.2f}) KB")


def build_browser(src: Path, root: Path, browser: str) -> None:
    out_dir = root / "dist" / f"{browser}"
    zip_path = root / f"extension-{browser}.zip"

    print(f"Building {browser} extension...")

    clean_output(out_dir, zip_path)
    overlay(src / "shared", out_dir)
    overlay(src / "browser" / "shared", out_dir)
    overlay(src / "browser" / browser, out_dir)
    zip_output(out_dir, zip_path)

    size_kb = zip_path.stat().st_size / 1024
    print(f"Built {zip_path} – {size_kb:.2f}) KB")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--version",
        required=True,
    )
    parser.add_argument(
        "--browser"
    )
    args = parser.parse_args()

    if args.version == "browser" and not args.browser:
        parser.error("--browser is required when --version=browser")

    if args.version == "browser" and args.browser not in ["chrome", "firefox"]:
        parser.error("--browser must be either 'chrome' or 'firefox'")

    root = Path(__file__).parent.resolve()
    src = root / "src"

    if args.version == "thunderbird":
        build_thunderbird(src, root)

    elif args.version == "browser":
        build_browser(src, root, args.browser)


if __name__ == "__main__":
    main()