# Voice File Renaming Script

This script renames audio files based on mappings defined in a CSV file. 
It's designed to process voice navigation files by matching source filenames (with zero-padding) to target filenames.

## Features

- **CSV-based mapping**: Reads mappings from specified (e.g. `Mudita_Audio_Files_Transcription.csv`)
- **Zero-padding handling**: Automatically strips leading zeros (e.g., `0001-Block.mp3` matches `1-Block`)
- **Safe copying**: Copies files instead of moving them (originals preserved)
- **Extension preservation**: Keeps the same file extension as source files
- **Smart conflict handling**:
  - Automatically removes files with same name but different extension (e.g., replaces `1.mp3` with `1.ogg`)
  - Tracks separately whether files were overwritten (same extension) or replaced (different extension)
- **Detailed reporting**: Shows statistics for processed files, skipped items, and errors
- **Dry-run mode**: Preview changes without actually copying files
- **Verbose logging**: Optional detailed output for debugging

## Requirements

- Python 3.6 or higher
- No external dependencies (uses only standard library)

## Usage

### Basic Usage

```bash
python3 rename_voice_files.py -i <input_folder> -o <output_folder>
```

### Example: Process Czech voice files

```bash
python3 rename_voice_files.py -i ../raw-voices/Nawigacja-Czeski -o ../resources/voice/cs/voice
```

### Command-line Options

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --input` | Input directory with source audio files (required) | - |
| `-o, --output` | Output directory for renamed files (required) | - |
| `--csv` | Path to CSV file with mappings | `Mudita_Audio_Files_Transcription.csv` |
| `--extension` | File extension to match | `.mp3` |
| `-v, --verbose` | Enable verbose output | disabled |
| `--dry-run` | Preview changes without copying files | disabled |

## CSV Format

The script expects a CSV file with the following columns:

- **Voice file name**: Source filename pattern (e.g., `1-Block`)
- **File Name**: Target filename (e.g., `1`)

Example CSV structure:
```csv
File Name,Voice file name,English,Comment
1,1-Block,One,,
1_hour,2-Block,One hour,,
1_minute,3-Block,One minute,,
```

### Important Notes

- The script only uses the `Voice file name` and `File Name` columns
- Rows with empty `File Name` values are skipped
- The script automatically handles zero-padded filenames (e.g., `0001-Block.mp3` → `1-Block`)

## Output Report

After processing, the script displays a summary report:

```
============================================================
PROCESSING REPORT
============================================================
Files processed:              151
Files overwritten (same ext): 1
Files replaced (diff ext):    3
Skipped (empty name):         0
Skipped (not found):          2
Errors:                       0
============================================================
```

### Report Fields

- **Files processed**: Number of files successfully copied
- **Files overwritten (same ext)**: Number of files replaced with same extension (e.g., `1.mp3` → `1.mp3`)
- **Files replaced (diff ext)**: Number of files replaced with different extension (e.g., `1.mp3` → `1.ogg`)
- **Skipped (empty name)**: Rows in CSV with empty `File Name` values
- **Skipped (not found)**: Source files not found in input directory
- **Errors**: Number of errors encountered during processing

## How It Works

1. **Parse CSV**: Reads the CSV file and creates a mapping of source → target filenames
2. **Find files**: Scans the input directory for files matching the specified extension
3. **Match files**: Strips leading zeros from filenames and matches them to CSV entries
4. **Remove conflicts**: Before copying, removes any existing files in output directory with the same base name but any extension
5. **Copy files**: Copies matched files to output directory with new names
6. **Generate report**: Displays statistics about the operation
