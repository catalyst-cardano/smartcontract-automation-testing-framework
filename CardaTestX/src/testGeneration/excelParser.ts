import * as XLSX from "xlsx";
import XLSX_CALC, { import_functions } from "xlsx-calc";
import * as formulajs from '@formulajs/formulajs'

var workbook: XLSX.WorkBook;

export function getWorkBook(filePath: string) {
    workbook = XLSX.readFile(filePath);
    return workbook;
}

export function getShetNameByIndex(workbook: XLSX.WorkBook, index: number) {
    const sheetNames = workbook.SheetNames;
    const indx = Number(index);
    if (indx >= 0 && indx <= sheetNames.length) {
        console.log("sheetNames[index]:", sheetNames[indx]);
        return sheetNames[indx];
    } else {
        throw console.error("Invalid sheet index.");
    }
}

export function getWorkSheet(workbook: XLSX.WorkBook, sheetName: string) {
    const worksheet = workbook.Sheets[sheetName];
    if (worksheet) {
        return worksheet;
    } else throw Error(`Found no sheet with name ${sheetName}`);
}

export function getDataFromSheet(
    workbook: XLSX.WorkBook,
    sheetName: string,
): any {
    console.log("Reading data from file ...");
    const worksheet = workbook.Sheets[sheetName];
    if (worksheet) {
        const dataObject = XLSX.utils.sheet_to_json(worksheet);
        return dataObject;
    } else throw Error(`Found no sheet with name ${sheetName}`);
}

export function setColumnValues(
    workbook: XLSX.WorkBook,
    sheetName: string,
    column: string,
    values: string[],
) {
    const data = getDataFromSheet(workbook, sheetName);

    if (values.length == data.length) {
        for (let i = 0; i < data.length; i++) {
            data[i][column] = values[i];
        }
        return data;
    } else {
        throw Error(
            `The number of values is not equal to the number of rows in the sheet.`,
        );
    }
}

export function getColumnValues(
    workbook: XLSX.WorkBook,
    sheetName: string,
    column: string,
) {
    const data = getDataFromSheet(workbook, sheetName);
    let values = [];
    if (data[0][column] === undefined) {
        return undefined;
    }
    for (let i = 0; i < data.length; i++) {
        values[i] = data[i][column];
    }

    return values;
}

export function updateExcelFile(
    workbook: XLSX.WorkBook,
    sheetName: string,
    columnIndex: number,
    values: string[],
    fileName: string,
) {
    const worksheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(worksheet["!ref"]!);
    for (let rowNum = range.s.r + 1; rowNum <= range.e.r; rowNum++) {
        const cellAddr = { c: columnIndex, r: rowNum };
        const cellRef = XLSX.utils.encode_cell(cellAddr);
        worksheet[cellRef] = { t: "s", v: values[rowNum - 1] };
    }
    XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    XLSX.writeFileXLSX(workbook, fileName);
}

export async function writeToFile(
    workbook: XLSX.WorkBook,
    sheetName: string,
    filePath: string,
    data: any,
) {
    var worksheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets[sheetName] = worksheet;
    XLSX.writeFile(workbook, filePath);
}

export function refreshAndGetDataFromSheet(
    workbook: XLSX.WorkBook,
    sheetName: string,
) {
    import_functions(formulajs);

    // Recalculate all formulas in the workbook
    XLSX_CALC(workbook, { continue_after_error: true, log_error: true });

    return getDataFromSheet(workbook, sheetName);
}


const Data = {
    Object: (schema: Record<string, any>) => schema,
    Bytes: () => "Data.Bytes",
    Integer: () => "Data.Integer",
};


function inferFieldType(value: any): any {
    if (typeof value === "number") return Data.Integer;
    if (typeof value === "string") return Data.Bytes;
    throw new Error(`Not support: ${typeof value}`);
}

export function generateSchema(testData: any): Record<string, any> {
    if (testData.length === 0) {
      throw new Error("Test data không được rỗng!");
    }
    const schema: Record<string, any> = {};
    Object.keys(testData).forEach((key) => {
        if(key.startsWith("datum")){
            schema[key] = inferFieldType(testData[key]);
        }
      });

  
    return schema;
  }

export function generateTypeScriptSchema(schema: Record<string, any>, variableNameDatum: string): string {
    let tsSchema = `const ${variableNameDatum}Schema= Data.Object({\n`;

    Object.keys(schema).forEach((key) => {
        const type = schema[key] === Data.Bytes ? "Data.Bytes()" : "Data.Integer()";
        tsSchema += `  ${key}: ${type},\n`;
      });

    tsSchema += `});\n`;
    tsSchema +=`type ${variableNameDatum} = Data.Static<typeof ${variableNameDatum}Schema>;\n`;
    tsSchema +=`const ${variableNameDatum} = ${variableNameDatum}Schema as unknown as ${variableNameDatum};\n`;
    return tsSchema;
}

export const processData = (data: any,variableNameDatum: string) => {
    let tsData =`const datum = Data.to<${variableNameDatum}>(\n`;
    tsData +=`{\n`;
    const processedData: Record<string, any> = {};
  
    Object.keys(data).forEach((key) => {
      const value = data[key];
      if(key.startsWith("datum")){
      if (!isNaN(Number(value))) {
        processedData[key] = BigInt(value);
        tsData +=`${key}:${value}`;
      } else {
        processedData[key] = value;
        tsData +=`${key}:"${value}"`;
      }
      tsData +=`,\n`;
    }});
    tsData +=`},\n${variableNameDatum}\n`;
    tsData +=`);\n`;
    return tsData;
  };