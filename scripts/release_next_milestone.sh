#!/usr/bin/env bash

# FraudLens Smart Hackathon Releaser
# Dynamically randomizes commit intervals so that all 8 milestones
# are organically pushed and 100% completed by 3:00 PM today.

STATE_FILE=".git/milestone_state"
TARGET_HOUR=15 # 3:00 PM
TARGET_MINUTE=00

if [ ! -f "$STATE_FILE" ]; then
  echo "1" > "$STATE_FILE"
fi

release_stage() {
  local stage=$1

  case $stage in
    1)
      echo "📦 Releasing Milestone 1/8: Root configs & Project specifications"
      git add package.json docker-compose.yml PROJECT_DESCRIPTION.md scripts/
      git commit -m "chore: setup project structure, docker orchestrator and specifications"
      git push origin main
      echo "2" > "$STATE_FILE"
      ;;
    2)
      echo "📦 Releasing Milestone 2/8: Backend Express server & Storage engine"
      git add backend/package.json backend/package-lock.json backend/.env.example backend/Dockerfile backend/server.js backend/services/storage.js
      git commit -m "feat(backend): express api foundation, rate limiting, and json storage engine"
      git push origin main
      echo "3" > "$STATE_FILE"
      ;;
    3)
      echo "📦 Releasing Milestone 3/8: Rule-based Heuristic Scam Detectors"
      git add backend/services/nlpDetector.js backend/services/urlDetector.js
      git commit -m "feat(nlp): implement electricity scam heuristics and domain typosquatting detection"
      git push origin main
      echo "4" > "$STATE_FILE"
      ;;
    4)
      echo "📦 Releasing Milestone 4/8: UPI Reverse-Debit QR & XAI Service"
      git add backend/services/upiQrDetector.js backend/services/aiExplainer.js backend/services/groqClient.js
      git commit -m "feat(qr): add reverse-debit trap parser, groq llm client and 1930 report drafter"
      git push origin main
      echo "5" > "$STATE_FILE"
      ;;
    5)
      echo "📦 Releasing Milestone 5/8: Machine Learning Engine & Unit Tests"
      git add backend/ml_engine/ backend/tests/
      git commit -m "feat(ml): custom tf-idf naive bayes classifier and backend test suite"
      git push origin main
      echo "6" > "$STATE_FILE"
      ;;
    6)
      echo "📦 Releasing Milestone 6/8: Frontend Shell & 3D WebGL Threat Core"
      git add frontend/package.json frontend/package-lock.json frontend/vite.config.js frontend/tailwind.config.js frontend/postcss.config.js frontend/index.html frontend/nginx.conf frontend/Dockerfile frontend/src/index.css frontend/src/main.jsx frontend/src/App.jsx frontend/src/components/ThreeThreatShield.jsx frontend/src/components/HeroSection.jsx frontend/src/components/Navbar.jsx frontend/src/components/AuroraBackground.jsx
      git commit -m "feat(frontend): reactive 3d three.js threat shield and core application layout"
      git push origin main
      echo "7" > "$STATE_FILE"
      ;;
    7)
      echo "📦 Releasing Milestone 7/8: Detection Analyzers & Metric Meters"
      git add frontend/src/components/RiskMeter.jsx frontend/src/components/RiskScore.jsx frontend/src/components/MessageAnalyzer.jsx frontend/src/components/URLAnalyzer.jsx frontend/src/components/QRScanner.jsx frontend/src/components/AnalyzerTabs.jsx frontend/src/components/DetectionReasons.jsx frontend/src/components/AIExplanation.jsx frontend/src/components/Reveal.jsx frontend/src/components/TextReveal.jsx frontend/src/components/GlowButton.jsx frontend/src/components/FloatingElements.jsx
      git commit -m "feat(ui): implement multi-modal message, url, and qr camera scanning chambers"
      git push origin main
      echo "8" > "$STATE_FILE"
      ;;
    8)
      echo "📦 Releasing Milestone 8/8: Playbook, Telemetry & Full Integration"
      git add frontend/src/
      git commit -m "feat(playbook): add curated attack scenario playbook, live telemetry and audit trail"
      git push origin main
      echo "DONE" > "$STATE_FILE"
      echo "🎉 All 8 hackathon milestones successfully completed before 3:00 PM!"
      return 0
      ;;
    DONE)
      echo "✅ All milestones have already been pushed to GitHub!"
      return 0
      ;;
  esac
}

# Calculate target 3:00 PM timestamp (today)
get_target_epoch() {
  date -v${TARGET_HOUR}H -v${TARGET_MINUTE}M -v00S +%s 2>/dev/null || date -d "15:00:00" +%s
}

if [ "$1" == "--auto" ]; then
  echo "=========================================================="
  echo "🤖 FraudLens Smart Random-Interval Hackathon Releaser"
  echo "🎯 Target Completion: 3:00 PM Today"
  echo "🎲 Interval Style: Natural Random Timings (~22 - 35 mins)"
  echo "=========================================================="
  
  while true; do
    CURR=$(cat "$STATE_FILE" 2>/dev/null || echo "1")
    if [ "$CURR" == "DONE" ]; then
      echo "🎉 All milestones released before 3:00 PM! Auto-releaser complete."
      break
    fi

    echo ""
    echo "▶️ [$(date '+%Y-%m-%d %H:%M:%S')] Executing Milestone $CURR of 8..."
    release_stage "$CURR"
    
    NEXT=$(cat "$STATE_FILE" 2>/dev/null || echo "DONE")
    if [ "$NEXT" == "DONE" ]; then
      echo "🎉 Finished final milestone before 3:00 PM!"
      break
    fi

    # Calculate remaining time until 3:00 PM
    NOW_EPOCH=$(date +%s)
    TARGET_EPOCH=$(get_target_epoch)
    REMAINING_SECS=$((TARGET_EPOCH - NOW_EPOCH))
    
    # Milestones remaining after this one
    REMAINING_STAGES=$((9 - NEXT))
    if [ "$REMAINING_STAGES" -le 0 ]; then
      REMAINING_STAGES=1
    fi

    # Target average seconds per remaining stage
    AVG_SECS=$((REMAINING_SECS / REMAINING_STAGES))
    if [ "$AVG_SECS" -le 300 ]; then
      AVG_SECS=300 # minimum 5 min safety
    fi

    # Add random jitter between -240s and +240s (±4 minutes) for realistic human timing
    RAND_JITTER=$(( (RANDOM % 481) - 240 ))
    SLEEP_SECS=$(( AVG_SECS + RAND_JITTER ))
    
    # Cap sleep so it doesn't overshoot 3:00 PM
    MAX_ALLOWABLE=$(( REMAINING_SECS - (REMAINING_STAGES - 1) * 300 ))
    if [ "$SLEEP_SECS" -gt "$MAX_ALLOWABLE" ]; then
      SLEEP_SECS=$MAX_ALLOWABLE
    fi
    if [ "$SLEEP_SECS" -lt 300 ]; then
      SLEEP_SECS=300
    fi

    SLEEP_MINS=$(( SLEEP_SECS / 60 ))
    NEXT_RUN_TIME=$(date -r $((NOW_EPOCH + SLEEP_SECS)) '+%I:%M %p' 2>/dev/null || date -d "@$((NOW_EPOCH + SLEEP_SECS))" '+%I:%M %p')

    echo "🎲 Random delay: $SLEEP_MINS minutes ($SLEEP_SECS seconds)"
    echo "⏰ Next push (Milestone $NEXT) scheduled at: $NEXT_RUN_TIME"
    echo "⏳ Sleeping until next random release..."
    sleep "$SLEEP_SECS"
  done
else
  CURR=$(cat "$STATE_FILE" 2>/dev/null || echo "1")
  release_stage "$CURR"
fi
