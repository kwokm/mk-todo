# Brewfile for mk-todo
# Next.js 16 + React 19 + TypeScript + Bun
#
# Setup:
#   brew bundle
#   bun install
#   bunx playwright install  # install Playwright browser binaries
#   cp .env.example .env.local  # then fill in Upstash Redis credentials

# Core runtime & package manager
brew "bun"       # package manager (project requires bun, see packageManager field)
brew "node"      # Node.js runtime (needed by Playwright and some Next.js tooling)
brew "git"       # version control (also used by the prepare script for git hooks)

# File watching (improves Next.js dev server performance on macOS)
brew "watchman"
