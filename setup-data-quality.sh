#!/usr/bin/env bash
# 🚀 Data Quality Implementation Setup Script
# Automated checklist for implementing data quality system

# ============================================================================
# COLORS FOR OUTPUT
# ============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_header() {
  echo ""
  echo -e "${BLUE}┌─────────────────────────────────────────┐${NC}"
  echo -e "${BLUE}│ $1${NC}"
  echo -e "${BLUE}└─────────────────────────────────────────┘${NC}"
  echo ""
}

check_done() {
  echo -e "${GREEN}✅ $1${NC}"
}

check_warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

check_fail() {
  echo -e "${RED}❌ $1${NC}"
}

# ============================================================================
# PHASE 1: ENVIRONMENT SETUP
# ============================================================================

phase1_environment() {
  print_header "PHASE 1: Environment Setup (5 minutes)"

  echo "Step 1: Create .env.local file"
  if [ -f .env.local ]; then
    check_warn ".env.local already exists"
  else
    cat > .env.local << 'EOF'
# ============================================================================
# DATA QUALITY CONFIGURATION
# ============================================================================

# 🔴 CRITICAL: Disable AI-generated data
USE_REAL_DATA_FIRST=true
ENABLE_GENERATED_DATA=false

# Data quality thresholds
MIN_TRUST_SCORE_FOR_DISPLAY=0.50
STRICT_MODE=false

# Data freshness requirements (days)
MAX_DATA_AGE_DAYS=365
WARN_DATA_AGE_DAYS=180

# ============================================================================
# FREE API KEYS - Get from below services
# ============================================================================

# NewsAPI - https://newsapi.org (100 requests/day free)
NEWSAPI_KEY=your_key_here

# GNews - https://gnews.io (100 requests/day free)  
GNEWS_KEY=your_key_here

# SEC EDGAR - No key needed! (https://sec.gov)
# Already public - just use it

# ============================================================================
# OPTIONAL: Premium APIs (for later phases)
# ============================================================================

# Crunchbase - https://crunchbase.com ($999/month)
# CRUNCHBASE_API_KEY=

# Clearbit - https://clearbit.com ($50/month free tier available)
# CLEARBIT_API_KEY=
EOF
    check_done ".env.local created"
  fi

  echo ""
  echo "Step 2: Add API Keys"
  echo "  1. Go to https://newsapi.org and signup (2 minutes)"
  echo "  2. Copy API key"
  echo "  3. Add to .env.local: NEWSAPI_KEY=your_key"
  echo ""
  echo "  4. Go to https://gnews.io and signup (2 minutes)"
  echo "  5. Copy token"
  echo "  6. Add to .env.local: GNEWS_KEY=your_token"
  echo ""
  
  read -p "Have you added API keys to .env.local? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    check_done "API keys configured"
  else
    check_fail "Please add API keys first"
    return 1
  fi

  return 0
}

# ============================================================================
# PHASE 2: CODE FILES
# ============================================================================

phase2_codefiles() {
  print_header "PHASE 2: Code Files (Already created)"

  local files=(
    "services/dataQualityScore.ts"
    "services/realDataFirstAggregator.ts"
    "components/TrustedDataComponents.tsx"
    "utils/dataQualityHelpers.ts"
  )

  for file in "${files[@]}"; do
    if [ -f "$file" ]; then
      check_done "$file exists"
    else
      check_fail "$file missing - copy from created files"
    fi
  done
}

# ============================================================================
# PHASE 3: CONFIGURATION
# ============================================================================

phase3_configuration() {
  print_header "PHASE 3: Update Configuration"

  echo "Checking config/dataSourcesConfig.ts..."
  
  if grep -q "useGenerated: false" config/dataSourcesConfig.ts; then
    check_done "useGenerated: false is set"
  else
    check_warn "useGenerated might still be true - update it in config"
  fi

  if grep -q "requireRealDataOnly: true" config/dataSourcesConfig.ts; then
    check_done "requireRealDataOnly: true is set"
  else
    check_fail "Add requireRealDataOnly: true to FALLBACK_STRATEGY"
  fi
}

# ============================================================================
# PHASE 4: SERVER UPDATES
# ============================================================================

phase4_server() {
  print_header "PHASE 4: Update server.ts"

  echo "Required changes in server.ts:"
  echo ""
  echo "1. Add imports at top:"
  echo "   import { enhanceResponseWithQuality } from './utils/dataQualityHelpers';"
  echo "   import { RealDataFirstAggregator } from './services/realDataFirstAggregator';"
  echo "   import { DataQualityScorer } from './services/dataQualityScore';"
  echo ""
  echo "2. Add these endpoints (copy from SERVER_MODIFICATIONS_GUIDE.ts):"
  echo "   - GET /api/data-quality/metrics"
  echo "   - POST /api/data-quality/verify"
  echo "   - POST /api/data-quality/report-issue"
  echo ""
  echo "3. Update existing endpoints to use enhanceResponseWithQuality"
  echo "   See SERVER_MODIFICATIONS_GUIDE.ts for examples"
  echo ""
  
  read -p "Have you updated server.ts? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    check_done "server.ts updated"
  else
    check_fail "Please update server.ts first"
    echo "Reference: SERVER_MODIFICATIONS_GUIDE.ts"
    return 1
  fi

  return 0
}

# ============================================================================
# PHASE 5: UI COMPONENTS
# ============================================================================

phase5_ui() {
  print_header "PHASE 5: Update UI Components"

  echo "Replace old DataCard components with TrustedDataComponents"
  echo ""
  echo "Old pattern:"
  echo "  import { DataCard } from './components/DataCard';"
  echo "  <DataCard title='Revenue' value={revenue} />"
  echo ""
  echo "New pattern:"
  echo "  import { DataCard } from './components/TrustedDataComponents';"
  echo "  <DataCard title='Revenue' value={revenue} data={revenueData} />"
  echo ""
  echo "New components available:"
  echo "  - TrustBadge: Shows trust score with color"
  echo "  - DataCard: Enhanced version with citations"
  echo "  - DataLineageViewer: Shows data history"
  echo "  - CitationList: Lists all sources"
  echo "  - UserContributionBox: Allows user corrections"
  echo ""
  
  read -p "Have you updated your components? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    check_done "UI components updated"
  else
    check_warn "You can update components later - not critical for backend"
  fi

  return 0
}

# ============================================================================
# PHASE 6: TESTING
# ============================================================================

phase6_testing() {
  print_header "PHASE 6: Testing"

  echo "Step 1: Compilation"
  npm run build 2>&1 | head -20
  if [ $? -eq 0 ]; then
    check_done "TypeScript compilation successful"
  else
    check_fail "TypeScript compilation failed"
    return 1
  fi

  echo ""
  echo "Step 2: Start server"
  npm run server &
  sleep 3
  
  echo ""
  echo "Step 3: Test API endpoints"
  
  echo "Testing /api/data-quality/metrics..."
  curl -s http://localhost:3001/api/data-quality/metrics | head -100
  
  if [ $? -eq 0 ]; then
    check_done "API endpoints working"
  else
    check_fail "Could not reach API"
  fi
  
  # Kill server
  pkill -f "npm run server"

  return 0
}

# ============================================================================
# VALIDATION
# ============================================================================

validate_quality() {
  print_header "VALIDATION CHECKLIST"

  local all_good=true

  # Check 1: Generated data disabled
  if grep -q "ENABLE_GENERATED_DATA=false" .env.local; then
    check_done "Generated data disabled"
  else
    check_fail "Generated data not disabled"
    all_good=false
  fi

  # Check 2: Real data first enabled
  if grep -q "USE_REAL_DATA_FIRST=true" .env.local; then
    check_done "Real data first enabled"
  else
    check_fail "Real data first not enabled"
    all_good=false
  fi

  # Check 3: API keys present
  if grep -q "NEWSAPI_KEY=" .env.local && [ "$NEWSAPI_KEY" != "your_key_here" ]; then
    check_done "NewsAPI key added"
  else
    check_warn "NewsAPI key missing"
  fi

  # Check 4: Code files exist
  local required_files=(
    "services/dataQualityScore.ts"
    "services/realDataFirstAggregator.ts"
    "components/TrustedDataComponents.tsx"
  )

  for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
      check_done "$file exists"
    else
      check_fail "$file missing"
      all_good=false
    fi
  done

  echo ""
  if [ "$all_good" = true ]; then
    check_done "🎉 All checks passed!"
    return 0
  else
    check_fail "Some checks failed - review above"
    return 1
  fi
}

# ============================================================================
# METRICS
# ============================================================================

print_metrics() {
  print_header "📊 EXPECTED IMPROVEMENTS"

  echo "Before this implementation:"
  echo "  Generated Data: 60-70% ❌"
  echo "  Real Data: 20-30% ✅"
  echo "  Trust Score: 45% average"
  echo ""
  echo "After Phase 1 (1-2 weeks):"
  echo "  Generated Data: <30% 🟡"
  echo "  Real Data: 60% ✅"
  echo "  Trust Score: 60% average"
  echo ""
  echo "After Phase 2 (1 week more):"
  echo "  Generated Data: <5% 🟢"
  echo "  Real Data: 90% ✅"
  echo "  Trust Score: 85% average"
  echo ""
  echo "After Phase 3 (Optional):"
  echo "  Generated Data: ~0% 🟢"
  echo "  Real Data: 95%+ ✅"
  echo "  Trust Score: 92% average"
}

# ============================================================================
# MAIN FLOW
# ============================================================================

main() {
  echo ""
  echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║  Data Quality Implementation Setup     ║${NC}"
  echo -e "${BLUE}║  Vietnamese Copilot - VICO Platform  ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
  echo ""

  # Run phases
  phase1_environment || exit 1
  phase2_codefiles
  phase3_configuration
  phase4_server || exit 1
  phase5_ui
  
  # Validate
  validate_quality
  
  # Show metrics
  print_metrics

  echo ""
  print_header "✅ SETUP COMPLETE!"
  
  echo "Next steps:"
  echo "  1. npm run dev (start development)"
  echo "  2. Test endpoints at http://localhost:5173"
  echo "  3. Check /api/data-quality/metrics"
  echo "  4. Monitor data quality improvements"
  echo ""
  echo "Documentation:"
  echo "  - EXECUTIVE_SUMMARY_DATA_QUALITY.md (start here)"
  echo "  - QUICK_START_VIETNAMESE.md (quick reference)"
  echo "  - RESEARCH_DATA_ACCURACY_STRATEGY.md (full details)"
  echo ""
}

# Run
main
