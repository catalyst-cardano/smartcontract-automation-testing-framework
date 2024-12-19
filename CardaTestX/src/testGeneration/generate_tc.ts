import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { getTestDataObject, getTestCaseInfo } from "../utils/common";
import { generateSchema, generateTypeScriptSchema, processData } from './excelParser';

class TestCaseGenerator {
    private filePath: string;
    private outputDir: string;
    private sheetIndex:number;

    constructor(filePath: string, outputDir: string,sheetIndex:number) {
        this.filePath = filePath;
        this.outputDir = outputDir;
        this.sheetIndex=sheetIndex;
    }

    // Push test cases to JIRA and generate test scripts
    public async generateTestScripts() {

        //convert Excel to Json
        const loadTestToJson = (filePath: string): any[] => {
            const workbook = XLSX.readFile(filePath);

            const sheetName = workbook.SheetNames[this.sheetIndex];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
            this.outputDir=this.outputDir+"/ts_"+sheetName+".ts";
            return jsonData;
        }

        //load test cases in test case json file
        const testCases = loadTestToJson(this.filePath);

        const dir = path.dirname(this.outputDir);
        //check that test suite folder is existed
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        let scriptContent = `import { isValidTxHash} from "../../utils/common";\n`;
        scriptContent += `import { expect, test,beforeEach, afterEach } from "bun:test";\n`;
        scriptContent += `import { Data } from "@lucid-evolution/lucid";\n`;
        
        let existedListTx: string[] = [];
        for (const txLib of testCases) {
            const { transaction } = txLib;
            if (!existedListTx.includes(transaction)) {
                existedListTx.push(transaction);
                scriptContent += `import {${transaction}} from "../../transactions/vesting-tx";\n`;
            }
        }
        scriptContent += `\n\n`;
        scriptContent += `beforeEach(() => {\n`;
        scriptContent += `console.log("#====================Running test===========================#");\n`;
        scriptContent += `});\n\n`;
        scriptContent += `afterEach(async () => {\n`;
        scriptContent += `console.log("#====================Ending test===========================#");\n`;
        scriptContent += `console.log("Waiting 30s................................................");\n`;
        scriptContent +=` await new Promise(resolve => setTimeout(resolve, 30000));\n`;
        scriptContent += `});\n\n`;
        //generate test scripts
        await this.createScript(testCases, scriptContent);

    }
    /**
     * Create test scripts
     * @param testCases 
     */
    private async createScript(testCases: any[], scriptContent: string) {

        for (const tc of testCases) {
            const testCaseInfo = await getTestCaseInfo(tc);
            const testDataInfo = await getTestDataObject(tc);

            let testID = testCaseInfo.id;
            const testTitle = testCaseInfo.title;
            const testData = JSON.stringify(testDataInfo, null, "\t\t").replaceAll("}", "\n\t}");
            const testExpected = testCaseInfo.expected;
            const testTx = testCaseInfo.transaction;

            const schema=generateSchema(JSON.parse(testData));
            const tsSchema=generateTypeScriptSchema(schema,"DatumLock");
            const tsData= processData(JSON.parse(testData),"DatumLock");
            scriptContent += `\n\n`;
            scriptContent += `/**\n`;
            scriptContent +=`* TestID:${testID}\n`;
            scriptContent +=`* Test title:${testTitle}\n`;
            scriptContent +=`* Expected Results:${testExpected}\n`;
            scriptContent +=`*/\n`;
            scriptContent +=`test(\n`;
            scriptContent +=`\"[Test] - [${testID}]${testTitle}\",\n`;
            scriptContent +=`async () =>{\n`;
            scriptContent +=`console.log("#========${testID}:${testTitle}=========#");\n`;
            scriptContent +=tsSchema;
            scriptContent +=tsData;
            scriptContent +=`const testData=${testData}\n`;
            scriptContent +=`const tx = await ${testTx}(datum,testData);\n`;
            scriptContent +=`const isExpectedResult=${testExpected};\n`;
            scriptContent +=`const isActualResult=isValidTxHash(tx);\n`;
            scriptContent +=`console.log("isExpectedResult:",isExpectedResult);\n`;
            scriptContent +=`console.log("isActualResult:",isActualResult);\n`;
            scriptContent +=`expect(isActualResult).toEqual(isExpectedResult);\n`;
            scriptContent +=`},6000000`;
            scriptContent +=`);\n`;
            
        }

        fs.writeFileSync(this.outputDir, scriptContent, 'utf-8');
    }

}

export default TestCaseGenerator;