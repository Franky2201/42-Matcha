#!/usr/bin/env bash
# ==============================================================================
# Makefile Integration Test Suite
# Runs and validates targets in Makefile
# ==============================================================================

set -u

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NO_COLOR='\033[0m'

PASSED_COUNT=0
FAILED_COUNT=0
SKIPPED_COUNT=0
FAILED_TARGETS=()

run_test() {
    local target_name="$1"
    local description="$2"
    local check_cmd="${3:-}"

    printf "${BLUE}[TEST] Testing 'make %s' - %s...${NO_COLOR}\n" "$target_name" "$description"
    
    if make "$target_name"; then
        if [ -n "$check_cmd" ]; then
            if eval "$check_cmd"; then
                printf "${GREEN}✔ PASS: 'make %s' succeeded and post-validation passed.${NO_COLOR}\n\n" "$target_name"
                PASSED_COUNT=$((PASSED_COUNT + 1))
            else
                printf "${RED}✘ FAIL: 'make %s' command succeeded but post-validation failed.${NO_COLOR}\n\n" "$target_name"
                FAILED_COUNT=$((FAILED_COUNT + 1))
                FAILED_TARGETS+=("$target_name (validation failed)")
            fi
        else
            printf "${GREEN}✔ PASS: 'make %s' succeeded.${NO_COLOR}\n\n" "$target_name"
            PASSED_COUNT=$((PASSED_COUNT + 1))
        fi
    else
        printf "${RED}✘ FAIL: 'make %s' failed.${NO_COLOR}\n\n" "$target_name"
        FAILED_COUNT=$((FAILED_COUNT + 1))
        FAILED_TARGETS+=("$target_name")
    fi
}

skip_test() {
    local target_name="$1"
    local reason="$2"
    printf "${YELLOW}➜ SKIP: 'make %s' - %s${NO_COLOR}\n\n" "$target_name" "$reason"
    SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
}

printf "${BLUE}==============================================================================${NO_COLOR}\n"
printf "${BLUE} Starting Makefile Test Suite${NO_COLOR}\n"
printf "${BLUE}==============================================================================${NO_COLOR}\n\n"

# 1. Setup & Verification Targets
run_test "help" "Prints help message"
run_test "check-env" "Ensures .env exists"

if docker info >/dev/null 2>&1; then
    run_test "check-docker" "Verifies Docker daemon and Compose availability"
    run_test "check" "Verifies both environment and Docker"
else
    skip_test "check-docker" "Docker daemon is not running"
    skip_test "check" "Docker daemon is not running"
fi

# 2. Local Environment Setup & Compilation
run_test "install-local" "Installs frontend dependencies and Python venv"
run_test "types" "Generates GraphQL schema and TypeScript definitions" "[ -f apps/frontend/src/types/graphql.ts ]"
run_test "format" "Auto-formats backend (Ruff) and frontend (ESLint)"
run_test "lint" "Lints backend and frontend codebases"
run_test "build" "Compiles backend Python files and builds frontend distribution bundle" "[ -d apps/frontend/dist ]"

# 3. Cleanup Target
run_test "clean" "Cleans build artifacts and caches" "[ ! -d apps/frontend/dist ] && [ ! -f apps/frontend/schema.graphql ]"


# 4. Docker Integration Workflows
if docker info >/dev/null 2>&1; then
    run_test "up" "Spins up Docker development containers"
    run_test "status" "Checks Docker container status"

    run_test "down" "Stops Docker development containers"
    run_test "ci" "Runs local CI simulation inside Docker containers"
else
    skip_test "up" "Docker daemon is not running"
    skip_test "status" "Docker daemon is not running"
    skip_test "down" "Docker daemon is not running"
    skip_test "ci" "Docker daemon is not running"
fi

# Final Summary Report
printf "${BLUE}==============================================================================${NO_COLOR}\n"
printf "${BLUE} Makefile Test Summary${NO_COLOR}\n"
printf "${BLUE}==============================================================================${NO_COLOR}\n"
printf "${GREEN} Passed:  %d${NO_COLOR}\n" "$PASSED_COUNT"
printf "${RED} Failed:  %d${NO_COLOR}\n" "$FAILED_COUNT"
printf "${YELLOW} Skipped: %d${NO_COLOR}\n" "$SKIPPED_COUNT"

if [ "$FAILED_COUNT" -gt 0 ]; then
    printf "\n${RED}Failed targets:${NO_COLOR}\n"
    for target in "${FAILED_TARGETS[@]}"; do
        printf "  - %s\n" "$target"
    done
    printf "${BLUE}==============================================================================${NO_COLOR}\n"
    exit 1
else
    printf "\n${GREEN}All tested Makefile targets passed successfully!${NO_COLOR}\n"
    printf "${BLUE}==============================================================================${NO_COLOR}\n"
    exit 0
fi
