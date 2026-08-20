#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Usage:
    python build.py --version thunderbird
    python build.py --version browser --browser chrome
    python build.py --version browser --browser firefox

For Debug-Mode:
    python build.py --version thunderbird --debug
    python build.py --version browser --browser chrome --debug
    python build.py --version browser --browser firefox --debug
"""

import argparse
import re
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


DEBUG_FLAG_PATTERN = re.compile(r"(debug\s*:\s*)(true|false)(\s*,)")


def set_debug_flag(out_dir: Path, debug: bool) -> None:
    value = "true" if debug else "false"
    matches = list(out_dir.rglob("torpedo.js"))

    if not matches:
        print("  WARNING: torpedo.js not found in build output; debug flag not patched.")
        return

    for file_path in matches:
        content = file_path.read_text(encoding="utf-8")
        new_content, count = DEBUG_FLAG_PATTERN.subn(rf"\g<1>{value}\g<3>", content, count=1)

        if count:
            file_path.write_text(new_content, encoding="utf-8")

        else:
            print(f"  WARNING: found {file_path.relative_to(out_dir)} but no 'debug: true/false' pattern to patch.")


def build_thunderbird(src: Path, root: Path, debug: bool) -> None:
    out_dir = root / "dist" / "thunderbird"
    zip_path = root / "extension-thunderbird.zip"

    print("Building Thunderbird extension...")

    clean_output(out_dir, zip_path)
    overlay(src / "shared", out_dir)
    overlay(src / "thunderbird", out_dir)
    set_debug_flag(out_dir, debug)
    zip_output(out_dir, zip_path)

    size_kb = zip_path.stat().st_size / 1024
    print(f"Built {zip_path} – {size_kb:.2f} KB")


def build_browser(src: Path, root: Path, browser: str, debug: bool) -> None:
    out_dir = root / "dist" / f"{browser}"
    zip_path = root / f"extension-{browser}.zip"

    print(f"Building {browser} extension...")

    clean_output(out_dir, zip_path)
    overlay(src / "shared", out_dir)
    overlay(src / "browser" / "shared", out_dir)
    overlay(src / "browser" / browser, out_dir)
    set_debug_flag(out_dir, debug)
    zip_output(out_dir, zip_path)

    size_kb = zip_path.stat().st_size / 1024
    print(f"Built {zip_path} – {size_kb:.2f} KB")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--version",
        required=True,
    )
    parser.add_argument(
        "--browser"
    )
    parser.add_argument(
    "--debug",
    action="store_true"
    )
    args = parser.parse_args()

    if args.version == "browser" and not args.browser:
        parser.error("--browser is required when --version=browser")

    if args.version == "browser" and args.browser not in ["chrome", "firefox"]:
        parser.error("--browser must be either 'chrome' or 'firefox'")

    root = Path(__file__).parent.resolve()
    src = root / "src"

    if args.version == "thunderbird":
        build_thunderbird(src, root, args.debug)

    elif args.version == "browser":
        build_browser(src, root, args.browser, args.debug)


if __name__ == "__main__":
    main()