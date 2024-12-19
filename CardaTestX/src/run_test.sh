#!/usr/bin/env bash
set -e
set -o pipefail

TEST_CASE_PATH=./src/tests/test-cases/tc_vesting.xlsx
TEST_CASE_SHEETINDEX=0
TEST_SUITE_PATH=./src/tests/test-suites
#===========================HAPPY CASES===================================
#=====> Convert all test cases from excel file to test scripts file <=====
bun run ./src/index.ts $TEST_CASE_PATH $TEST_CASE_SHEETINDEX $TEST_SUITE_PATH

if [ -d "$TEST_SUITE_PATH" ]; then
    for FILE in "$TEST_SUITE_PATH"/*; do
        if [ -f "$FILE" ]; then
            echo "Run test suite: $FILE"
            #=====> Run test scripts<=====
            bun test --timeout 3000000 $FILE --coverage-reporter=text
        fi
    done
else
    echo "Folder $TEST_SUITE_PATH is not existed."
fi