#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Usage:
    python build.py --version browser
    python build.py --version thunderbird
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


def copy_shared(shared_src: Path, out_dir: Path) -> None:
    for src in shared_src.glob("*"):
        dest = out_dir / src.name
        if src.is_dir():
            shutil.copytree(src, dest, dirs_exist_ok=True)
        else:
            shutil.copy2(src, dest)


def overlay_version(ver_src: Path, out_dir: Path) -> None:
    for src in ver_src.glob("*"):
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


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--version",
        required=True,
    )
    args = parser.parse_args()

    root = Path(__file__).parent.resolve()
    src = root / "src"
    out_dir = root / "dist" / args.version
    zip_path = root / f"extension-{args.version}.zip"

    print(f"Building {args.version} extension...")
    clean_output(out_dir, zip_path)
    copy_shared(src / "shared", out_dir)
    overlay_version(src / args.version, out_dir)
    zip_output(out_dir, zip_path)

    size_kb = zip_path.stat().st_size / 1024
    print(f"Built {zip_path} – {size_kb:.2f} KB")


if __name__ == "__main__":
    main()