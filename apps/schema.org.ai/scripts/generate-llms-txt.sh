#!/bin/bash

# Generate llms.txt from all schema.org.ai documentation
# This script concatenates all documentation files into a single file for LLM consumption

set -e

cd "$(dirname "$0")/.."

echo "Generating llms.txt..."

# Create public directory if it doesn't exist
mkdir -p public

# Generate header
cat > public/llms.txt << 'EOF'
# schema.org.ai - Complete Documentation

> This file contains the complete schema.org.ai documentation optimized for Large Language Model consumption.
> Source: https://schema.org.ai
> GitHub: https://github.com/mdxld/mdxld
> Generated: $(date +%Y-%m-%d)
> Format: Markdown

================================================================================
TABLE OF CONTENTS
================================================================================

1. Introduction - What is schema.org.ai?
2. Type Definitions - 17 core AI-native types
3. JSON-LD Contexts - Vocabulary definitions

================================================================================

EOF

# Append homepage
cat content/index.mdx >> public/llms.txt 2>/dev/null || true

# Append all type definitions from schema directory
echo "" >> public/llms.txt
echo "================================================================================\n# TYPE DEFINITIONS\n================================================================================\n" >> public/llms.txt
for file in ../../schema/schema.org.ai/*.mdx; do
  if [ -f "$file" ]; then
    cat "$file" >> public/llms.txt
    echo "\n\n" >> public/llms.txt
  fi
done

# Append JSON-LD contexts
echo "" >> public/llms.txt
echo "================================================================================\n# JSON-LD CONTEXTS\n================================================================================\n" >> public/llms.txt
for file in ../../packages/mdxld/context/schema.org.ai/*.jsonld; do
  if [ -f "$file" ]; then
    echo "\n## $(basename "$file")\n" >> public/llms.txt
    cat "$file" >> public/llms.txt
    echo "\n\n" >> public/llms.txt
  fi
done

# Get file stats
LINES=$(wc -l < public/llms.txt | tr -d ' ')
SIZE=$(ls -lh public/llms.txt | awk '{print $5}')

echo "✓ Generated llms.txt"
echo "  Lines: $LINES"
echo "  Size:  $SIZE"
echo "  Location: public/llms.txt"
