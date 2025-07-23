#!/bin/bash

# getContext.bash - A script to generate a debugging context for your Next.js project.

# --- SCRIPT CONFIGURATION ---
OUTPUT_FILE_NAME="project_context.txt"
OUTPUT_FILE_PATH="$HOME/Desktop/$OUTPUT_FILE_NAME"

# --- COLORS for better UX ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# --- SCRIPT START ---
clear
echo -e "${GREEN}====================================================="
echo -e "  SYNAPSE Project Context Generator"
echo -e "=====================================================${NC}"
echo ""
echo -e "${YELLOW}This script will generate a file named '$OUTPUT_FILE_NAME' on your Desktop.${NC}"
echo -e "${YELLOW}Please share the entire content of that file for debugging.${NC}"
echo ""

# Check for the 'tree' command
if ! command -v tree &> /dev/null
then
    echo -e "${RED}Error: 'tree' command not found.${NC}"
    echo -e "${YELLOW}Please install it to get a proper file structure view.${NC}"
    echo "On Debian/Ubuntu: sudo apt-get install tree"
    echo "On macOS (with Homebrew): brew install tree"
    exit 1
fi

# This function contains all the logic that writes to the output file
generate_context() {
    echo "--- PROJECT STRUCTURE ---"
    # Get a clean list of all relevant files and folders, excluding heavy ones.
    tree -L 3 -I "node_modules|.next|dist|build"

    echo ""
    echo "--- KEY FILE CONTENTS ---"

    # Define the list of files to check based on whether a 'src' directory exists
    local filesToDisplay=()
    if [ -d "src" ]; then
        echo "Detected 'src' directory structure."
        filesToDisplay=(
            "package.json"
            "next.config.mjs"
            "tailwind.config.ts"
            "tsconfig.json"
            "middleware.ts"
            "src/i18n.ts"
            "src/app/layout.tsx"
            "src/app/[locale]/layout.tsx"
            "src/app/[locale]/page.tsx"
        )
    else
        echo "Detected non-'src' directory structure."
        filesToDisplay=(
            "package.json"
            "next.config.mjs"
            "tailwind.config.ts"
            "tsconfig.json"
            "middleware.ts"
            "i18n.ts"
            "app/layout.tsx"
            "app/[locale]/layout.tsx"
            "app/[locale]/page.tsx"
        )
    fi

    # Loop through the files and print their content
    for file in "${filesToDisplay[@]}"; do
        echo ""
        echo "-----------------------------------------------------"
        echo ">>> CONTENT OF: $file"
        echo "-----------------------------------------------------"
        if [ -f "$file" ]; then
            cat "$file"
        else
            echo "!!! FILE NOT FOUND AT THIS LOCATION !!!"
        fi
    done
}

# Execute the function and redirect all its output to the file
generate_context > "$OUTPUT_FILE_PATH"

echo ""
echo -e "${GREEN}====================================================="
echo -e "  SUCCESS!"
echo -e "The file '$OUTPUT_FILE_NAME' has been created on your Desktop."
echo -e "=====================================================${NC}".