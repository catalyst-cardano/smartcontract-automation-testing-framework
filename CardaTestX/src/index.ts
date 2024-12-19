import TestCaseGenerator from "./testGeneration/generate_tc";

const argvs = Bun.argv;
//Ignore 3 first arguments
const args = argvs.slice(2);

const testCases = args[0];
const sheetIndex = Number(args[1]);
const testSuite = args[2];

const generator= new TestCaseGenerator(testCases,testSuite,sheetIndex);
generator.generateTestScripts();