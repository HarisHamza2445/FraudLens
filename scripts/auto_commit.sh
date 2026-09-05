#!/usr/bin/env bash

# FraudLens Hackathon Auto-Commit Script
# Ensures commits and pushes happen at regular intervals (< 2 hours)
# Default interval: 90 minutes (5400 seconds)

INTERVAL_MINUTES=90
INTERVAL_SECONDS=$((INTERVAL_MINUTES * 60))
BRANCH="main"

echo "=================================================="
echo "🛡️  FraudLens Hackathon Auto-Commit Watcher"
echo "⏰  Commit Interval: Every $INTERVAL_MINUTES minutes"
echo "🌿  Target Branch: $BRANCH"
echo "=================================================="

# Ensure we are inside a git repository
if ! git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
  echo "❌ Error: Not a git repository. Run 'git init' first."
  exit 1
fi

while true; do
  echo ""
  echo "🔍 [$(date '+%Y-%m-%d %H:%M:%S')] Checking for changes..."

  # Check if there are uncommitted changes or untracked files
  if [ -n "$(git status --porcelain)" ]; then
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
    COMMIT_MSG="chore(hackathon): progress update $TIMESTAMP"
    
    echo "📦 Changes detected! Staging and committing..."
    git add .
    git commit -m "$COMMIT_MSG"
    
    echo "🚀 Pushing to origin $BRANCH..."
    if git push origin "$BRANCH"; then
      echo "✅ Successfully pushed commit to GitHub!"
    else
      echo "⚠️ Push failed. Check your internet connection or git remote credentials."
    fi
  else
    echo "ℹ️ No modified files detected. Skipping empty commit."
  fi

  echo "⏳ Next check in $INTERVAL_MINUTES minutes. Press [CTRL+C] to stop."
  sleep "$INTERVAL_SECONDS"
done
