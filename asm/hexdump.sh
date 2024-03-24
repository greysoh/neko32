#!/usr/bin/env bash

if [ $# -ne 1 ]; then
    echo "Usage: $0 <filename>"
    exit 1
fi

filename="$1"

# Check if the file exists
if [ ! -f "$filename" ]; then
    echo "Error: File '$filename' not found."
    exit 1
fi

# Dump the file in hex format
hexdump -ve '1/1 "%.2x "' "$filename"
echo ""  # Add a newline at the end
