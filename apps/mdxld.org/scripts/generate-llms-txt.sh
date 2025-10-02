#!/bin/bash

# Generate llms.txt from all MDXLD documentation
# This script concatenates all documentation files into a single file for LLM consumption

set -e

cd "$(dirname "$0")/.."

echo "Generating llms.txt..."

# Create public directory if it doesn't exist
mkdir -p public

# Generate header
cat > public/llms.txt << 'EOF'
# MDXLD (MDX Linked Data) - Complete Documentation

> This file contains the complete MDXLD documentation optimized for Large Language Model consumption.
> Source: https://mdxld.org
> GitHub: https://github.com/mdxld/mdxld
> Generated: $(date +%Y-%m-%d)
> Format: Markdown

================================================================================
TABLE OF CONTENTS
================================================================================

1. Introduction - What is MDXLD?
2. Getting Started - Installation and first document
3. Specification - Formal MDXLD standard v1.0
4. API Reference - TypeScript API documentation
5. Examples Index - Overview of all examples
6. Function Example - Executable code with inputs/outputs
7. Component Example - React UI components
8. Workflow Example - Multi-step orchestrations
9. Agent Example - AI agents with tools
10. API Example - RESTful endpoints
11. Integrations - Framework integration guides
12. JSON-LD Context - Vocabulary definitions

================================================================================

EOF

# Append all documentation files in order
cat content/index.mdx >> public/llms.txt
cat content/getting-started/index.mdx >> public/llms.txt
cat content/spec/index.mdx >> public/llms.txt
cat content/api/index.mdx >> public/llms.txt
cat content/examples/index.mdx >> public/llms.txt
cat content/examples/function.mdx >> public/llms.txt
cat content/examples/component.mdx >> public/llms.txt
cat content/examples/workflow.mdx >> public/llms.txt
cat content/examples/agent.mdx >> public/llms.txt
cat content/examples/api.mdx >> public/llms.txt
cat content/integrations/index.mdx >> public/llms.txt
cat ../../packages/mdxld/context/mdxld-context.jsonld >> public/llms.txt

# Get file stats
LINES=$(wc -l < public/llms.txt | tr -d ' ')
SIZE=$(ls -lh public/llms.txt | awk '{print $5}')

echo "✓ Generated llms.txt"
echo "  Lines: $LINES"
echo "  Size:  $SIZE"
echo "  Location: public/llms.txt"
