#!/usr/bin/env bash
# Restore agent symlinks. Run from project root after a fresh clone.
set -euo pipefail
cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
mkdir -p .gemini/antigravity .codex
ln -sf .agents/configs/claude/mcp.json                      .mcp.json
ln -sf ../.agents/configs/gemini/settings.json               .gemini/settings.json
ln -sf ../.agents/configs/codex/config.toml                  .codex/config.toml
ln -sf ../../.agents/configs/antigravity/mcp_config.json     .gemini/antigravity/mcp_config.json
echo "Symlinks restored."
