
# Smart Contract Testing Framework

## Overview
This framework facilitates testing of Aiken-based smart contracts by providing utilities to generate and execute test scripts from test case files. The framework organizes its components into a modular structure for easier management and execution.

## Folder Structure

### 1. **aiken-smart-contract**
- Contains Aiken libraries for smart contracts.
- Use the `aiken build` command to compile the smart contracts into a `plutus.json` file, which includes the validation script details.

### 2. **src/testGeneration**
- Includes classes to generate test scripts from test case Excel files located in the `tests/test-cases` folder.

### 3. **src/tests**
- **test-cases**: Stores Excel files that describe test cases.
- **test-suites**: Stores generated TypeScript test scripts based on the test cases.

### 4. **src/transactions**
- Contains TypeScript files for building and executing transactions.

### 5. **src/utils**
- Includes common utility functions used across the framework.

### 6. **src/index.ts**
- Main entry point for the framework.
- Reads input parameters and triggers test script generation from the test case files.

### 7. **run_test.sh**
- Shell script to automate test script generation and execution.

---

## Prerequisites

1. Install [Aiken](https://aiken-lang.org/).
2. Ensure Node.js and Bun are installed for TypeScript execution.
3. Install required Node.js dependencies by running:
   ```bash
   bun install
   ```
4. Rename `.env.preview` file to `.env` file
5. Place the smart contract code in the `aiken-smart-contract` folder.
6. Add test case Excel files to the `src/tests/test-cases` folder.

---

## Template Test Cases

The test case template is an Excel file with the following required fields:
- **id**: Unique identifier for the test case.
- **title**: A descriptive title for the test case.
- **expected**: The expected outcome of the test case.
- **transaction**: The transaction or operation to be executed in the test.

Additional fields can be added as needed for specific test scenarios. These fields are flexible and can include custom information such as fields of utxo datum.

Columns starting with the word "datum" will represent fields in the datum of a UTXO, while other columns will represent parameters to be passed in.

Example structure:
| id  | title                | expected      | transaction         |
|-----|----------------------|---------------|---------------------|
| 1   | Valid transaction    | true       | Build_valid_Tx      |
| 2   | Invalid signature    | false       | Build_invalid_Tx    |

---

## Usage

### Step 1: Build Smart Contracts
1. Navigate to the `aiken-smart-contract` folder.
2. Run the following command to build the smart contracts:
   ```bash
   aiken build
   ```
3. Ensure the `plutus.json` file is generated successfully.

### Step 2: Generate & Execute Test Scripts 
1. Run the shell script to execute the generated test scripts:
   ```bash
   ./run_test.sh
   ```
2. This script will:
   - Generate test scripts (if not already generated).
   - Execute the test scripts located in the `src/tests/test-suites` folder.

---

## Notes
- **Debugging**: Use Aiken CLI for debugging smart contracts if any issues arise.
- **Batch Testing**: Modify the `run_test.sh` script to include parallel execution for improved performance.
- **Utilities**: Extend the `src/utils` folder with additional functions as needed.

---

## Folder Dependencies

### Input Files
- **Smart Contracts**: Located in `aiken-smart-contract`.
- **Test Cases**: Excel files in `src/tests/test-cases`.

### Output Files
- **Validation Scripts**: `plutus.json` in `aiken-smart-contract`.
- **Generated Test Scripts**: TypeScript files in `src/tests/test-suites`.

---

## Example Workflow
1. Build the smart contracts:
   ```bash
   cd aiken-smart-contract
   aiken build
   ```
2. Execute the tests:
   ```bash
   ./run_test.sh
   ```

---

## Troubleshooting
- **Missing Dependencies**: Ensure Bun and Node.js are installed correctly.
- **Failed Tests**: Review the test scripts and debug the smart contracts using the Aiken CLI.
- **Script Errors**: Check the `src/utils` folder for reusable functions or add custom utilities as needed.

---

## Contribution
Feel free to contribute to this framework by extending its capabilities or reporting issues. Open a pull request or create an issue in the repository.
