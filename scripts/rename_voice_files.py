#!/usr/bin/env python3
"""
Voice File Renaming Script

Reads a CSV file with voice file mappings and renames audio files accordingly.
Matches files by stripping leading zeros from filenames.
"""

import argparse
import csv
import os
import re
import shutil
from pathlib import Path
from typing import Dict, List, Tuple


class VoiceFileRenamer:
    def __init__(self, csv_path: str, input_dir: str, output_dir: str,
                 extension: str = ".mp3", verbose: bool = False, dry_run: bool = False):
        self.csv_path = Path(csv_path)
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir)
        self.extension = extension
        self.verbose = verbose
        self.dry_run = dry_run

        # Statistics
        self.stats = {
            'processed': 0,
            'skipped_empty': 0,
            'skipped_not_found': 0,
            'overwritten': 0,
            'replaced_different_ext': 0,
            'errors': []
        }

    def log(self, message: str, force: bool = False):
        """Print message if verbose mode is enabled or force is True."""
        if self.verbose or force:
            print(message)

    def strip_leading_zeros(self, filename: str) -> str:
        """
        Strip leading zeros from numeric parts of filename.
        Example: '0001-Block' -> '1-Block'
        """
        def replace_zeros(match):
            number = match.group(1).lstrip('0') or '0'
            return number

        # Replace sequences of digits with the same digits but without leading zeros
        pattern = r'(\d+)'
        return re.sub(pattern, replace_zeros, filename)

    def remove_existing_files_with_same_name(self, target_base_name: str) -> List[Path]:
        """
        Find and remove all files in output directory with the same base name
        but any extension.

        Args:
            target_base_name: Base name without extension (e.g., '1', 'around')

        Returns:
            List of removed file paths
        """
        removed_files = []

        # Find all files with the same base name but any extension
        pattern = f"{target_base_name}.*"
        matching_files = list(self.output_dir.glob(pattern))

        for file_path in matching_files:
            # Only remove if it's a file (not directory) and has the exact base name
            if file_path.is_file() and file_path.stem == target_base_name:
                try:
                    if not self.dry_run:
                        file_path.unlink()
                    removed_files.append(file_path)
                    self.log(f"  Removed existing: {file_path.name}")
                except Exception as e:
                    error_msg = f"Error removing '{file_path.name}': {str(e)}"
                    self.log(f"  ❌ {error_msg}", force=True)
                    self.stats['errors'].append(error_msg)

        return removed_files

    def parse_csv(self) -> Dict[str, str]:
        """
        Parse CSV file and return mapping of voice file names to target file names.
        Returns: dict where key is 'Voice file name', value is 'File Name'
        """
        mapping = {}

        try:
            with open(self.csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)

                for row_num, row in enumerate(reader, start=2):  # start=2 because row 1 is header
                    voice_file_name = row.get('Voice file name', '').strip()
                    target_file_name = row.get('File Name', '').strip()

                    # Skip if File Name is empty
                    if not target_file_name:
                        self.log(f"Row {row_num}: Skipping empty 'File Name' for '{voice_file_name}'")
                        self.stats['skipped_empty'] += 1
                        continue

                    # Skip if Voice file name is empty
                    if not voice_file_name:
                        self.log(f"Row {row_num}: Skipping row with empty 'Voice file name'")
                        self.stats['skipped_empty'] += 1
                        continue

                    mapping[voice_file_name] = target_file_name
                    self.log(f"Mapped: '{voice_file_name}' -> '{target_file_name}'")

            self.log(f"\nLoaded {len(mapping)} mappings from CSV", force=True)
            return mapping

        except FileNotFoundError:
            raise FileNotFoundError(f"CSV file not found: {self.csv_path}")
        except KeyError as e:
            raise KeyError(f"CSV file missing required column: {e}")

    def find_matching_file(self, voice_file_name: str) -> Path | None:
        """
        Find a file in input directory that matches the voice file name.
        Handles zero-padding: '0001-Block.mp3' matches '1-Block'
        """
        # Get all files with the specified extension
        files = list(self.input_dir.glob(f"*{self.extension}"))

        for file_path in files:
            # Get filename without extension
            filename_no_ext = file_path.stem

            # Strip leading zeros from the file
            normalized_filename = self.strip_leading_zeros(filename_no_ext)

            # Check if it matches the voice file name
            if normalized_filename == voice_file_name:
                return file_path

        return None

    def process_files(self):
        """Main processing function."""
        # Validate paths
        if not self.csv_path.exists():
            raise FileNotFoundError(f"CSV file not found: {self.csv_path}")

        if not self.input_dir.exists():
            raise FileNotFoundError(f"Input directory not found: {self.input_dir}")

        # Create output directory if it doesn't exist
        if not self.dry_run:
            self.output_dir.mkdir(parents=True, exist_ok=True)

        # Parse CSV
        mapping = self.parse_csv()

        if not mapping:
            self.log("No valid mappings found in CSV file", force=True)
            return

        # Process each mapping
        self.log(f"\n{'='*60}", force=True)
        self.log(f"Processing files from: {self.input_dir}", force=True)
        self.log(f"Output directory: {self.output_dir}", force=True)
        if self.dry_run:
            self.log("DRY RUN MODE - No files will be copied", force=True)
        self.log(f"{'='*60}\n", force=True)

        for voice_file_name, target_file_name in mapping.items():
            # Find matching source file
            source_file = self.find_matching_file(voice_file_name)

            if source_file is None:
                self.log(f"⚠️  Not found: '{voice_file_name}' (target: '{target_file_name}')", force=True)
                self.stats['skipped_not_found'] += 1
                self.stats['errors'].append(f"Source file not found for '{voice_file_name}'")
                continue

            # Build target file path (keep original extension)
            target_file = self.output_dir / f"{target_file_name}{source_file.suffix}"

            # Remove any existing files with same name but different extension
            removed_files = self.remove_existing_files_with_same_name(target_file_name)

            # Track statistics for removed files
            same_extension_overwrite = False
            for removed_file in removed_files:
                if removed_file.suffix == source_file.suffix:
                    # Same extension - this is a simple overwrite
                    same_extension_overwrite = True
                    self.stats['overwritten'] += 1
                else:
                    # Different extension - replacing with new format
                    self.stats['replaced_different_ext'] += 1

            # Log the operation
            if same_extension_overwrite:
                action = "Would overwrite" if self.dry_run else "Overwriting"
                self.log(f"🔄 {action}: {target_file.name}", force=True)
            elif removed_files:
                action = "Would replace" if self.dry_run else "Replacing"
                old_exts = ', '.join([f.suffix for f in removed_files])
                self.log(f"🔄 {action} ({old_exts}): {source_file.name} -> {target_file.name}", force=True)
            else:
                action = "Would copy" if self.dry_run else "Copying"
                self.log(f"✓  {action}: {source_file.name} -> {target_file.name}", force=self.verbose)

            # Copy file
            if not self.dry_run:
                try:
                    shutil.copy2(source_file, target_file)
                    self.stats['processed'] += 1
                except Exception as e:
                    error_msg = f"Error copying '{source_file.name}': {str(e)}"
                    self.log(f"❌ {error_msg}", force=True)
                    self.stats['errors'].append(error_msg)
            else:
                self.stats['processed'] += 1

    def print_report(self):
        """Print final statistics report."""
        self.log(f"\n{'='*60}", force=True)
        self.log("PROCESSING REPORT", force=True)
        self.log(f"{'='*60}", force=True)
        self.log(f"Files processed:              {self.stats['processed']}", force=True)
        self.log(f"Files overwritten (same ext): {self.stats['overwritten']}", force=True)
        self.log(f"Files replaced (diff ext):    {self.stats['replaced_different_ext']}", force=True)
        self.log(f"Skipped (empty name):         {self.stats['skipped_empty']}", force=True)
        self.log(f"Skipped (not found):          {self.stats['skipped_not_found']}", force=True)
        self.log(f"Errors:                       {len(self.stats['errors'])}", force=True)

        if self.stats['errors']:
            self.log(f"\n{'='*60}", force=True)
            self.log("ERROR DETAILS:", force=True)
            self.log(f"{'='*60}", force=True)
            for i, error in enumerate(self.stats['errors'], 1):
                self.log(f"{i}. {error}", force=True)

        self.log(f"{'='*60}\n", force=True)


def main():
    parser = argparse.ArgumentParser(
        description='Rename voice files based on CSV mapping',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Example usage:
  python rename_voice_files.py -i ./Nawigacja-Czeski -o ./output
  python rename_voice_files.py -i ./input -o ./output --csv custom.csv --verbose
  python rename_voice_files.py -i ./input -o ./output --dry-run
        """
    )

    parser.add_argument(
        '-i', '--input',
        required=True,
        help='Input directory containing source audio files'
    )

    parser.add_argument(
        '-o', '--output',
        required=True,
        help='Output directory for renamed files'
    )

    parser.add_argument(
        '--csv',
        default='Mudita_Audio_Files_Transcription.csv',
        help='Path to CSV file with mappings (default: Mudita_Audio_Files_Transcription.csv)'
    )

    parser.add_argument(
        '--extension',
        default='.mp3',
        help='File extension to match (default: .mp3)'
    )

    parser.add_argument(
        '-v', '--verbose',
        action='store_true',
        help='Enable verbose output'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without copying files'
    )

    args = parser.parse_args()

    try:
        renamer = VoiceFileRenamer(
            csv_path=args.csv,
            input_dir=args.input,
            output_dir=args.output,
            extension=args.extension,
            verbose=args.verbose,
            dry_run=args.dry_run
        )

        renamer.process_files()
        renamer.print_report()

    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        return 1

    return 0


if __name__ == '__main__':
    exit(main())
