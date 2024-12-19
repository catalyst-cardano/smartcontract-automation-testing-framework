
import { initLucidBlockfrost } from "../utils/provider";
import * as fs from 'fs';
import { exec } from 'child_process';
import blueprint from "../../aiken-smart-contract/plutus.json";
import { applyDoubleCborEncoding, applyParamsToScript, credentialToAddress, Data, paymentCredentialOf, type SpendingValidator, type UTxO } from "@lucid-evolution/lucid";
const { NETWORK} = process.env;

export async function getScript(validatorIndex:number): Promise<SpendingValidator> {
  const compliteCode=blueprint.validators[validatorIndex].compiledCode;
  const scriptCbor= applyParamsToScript(applyDoubleCborEncoding(compliteCode),[])
  return {
    type: "PlutusV3",
    script: scriptCbor,
  };
}

export async function getDefaultScriptAddress() {
  return credentialToAddress(
    NETWORK,
    {
      type: "Script",
      hash: blueprint.validators[0].hash,
    },
  );
}


/**
 * Get wallet Address and payment public key of wallet address from wallet's seed key
 * @param seedKey
 * @returns 
 */
export async function getPaymentKey(seedKey:string){
  const lucid = await initLucidBlockfrost();
  lucid.selectWallet.fromSeed(seedKey);
  const walletAddr=await lucid.wallet().address();
  const paymentKey = paymentCredentialOf(walletAddr).hash;
  return {walletAddr,paymentKey}
}
/**
 * find utxos have lock asset to smart contract script
 * @param address 
 * @param datumType 
 * @param ownerPaymentKey 
 * @param beneficiaryPaymentKey 
 * @returns 
 */
export async function findUTxO(
  scriptAddress: string,
  lockDatumType: any,
  ownerPaymentKey:string,
  beneficiaryPaymentKey:string
) {
  const currentTime = new Date().getTime();
  const lucid = await initLucidBlockfrost();
  const utxos = await lucid.utxosAt(scriptAddress);
  const filteredUTxOs: UTxO[] = [];
  for (const utxo of utxos) {
    if (utxo.datum) {
      const datum = await lucid.datumOf(utxo, lockDatumType);
      if (datum.owner === ownerPaymentKey && datum.beneficiary === beneficiaryPaymentKey &&
        datum.lock_until <= currentTime) {
        filteredUTxOs.push(utxo);
      }
    }
  }

  return filteredUTxOs[0];
}

const {
  TEST_CASE_FIELDS,
} = process.env;

const testCaseFields = TEST_CASE_FIELDS.split(",");

/**
 * Get test data object
 * @param data
 * @returns
 */
export function getTestDataObject(data: any) {
  if (data === undefined) throw console.error("Test data object is empty");

  let testDataInfo: any = {};

  for (const field of testCaseFields) {
    delete data[field];
  }

  Object.keys(data).forEach((key) => {
    testDataInfo[key] = data[key];
  });

  return testDataInfo;
}

/**
* Get all information of a test case
* @param data
* @returns
*/
export function getTestCaseInfo(data: any) {
  if (data === undefined) throw console.error("Test case infor is empty");

  let testCaseInfo: any = {};

  for (const field of testCaseFields) {
    testCaseInfo[field] = data[field];
  }

  return testCaseInfo;
}
/**
 * Verify that result is a txhash of a transaction
 * @param txHash 
 * @returns 
 */
export function isValidTxHash(txHash: string): boolean {
  const pattern = /^[a-f0-9]{64}$/;
  return pattern.test(txHash);
}
/**
 * Write the club info down log file
 * @param utxos
 * @param datums 
 * @param filePath 
 * @returns 
 */
export function saveUTxOsToJsonFile(utxos: UTxO[], datums: any[], filePath: string) {
  if (datums.length < utxos.length) {
    console.error("Not enough datums to replace for each UTxO.");
    return;
  }

  const updatedUtxos = utxos.map((utxo, index) => ({
    ...utxo,
    datum: datums[index]
  }));

  const dataToWrite = {
    utxos: updatedUtxos.reduce((acc, utxo) => {
      const utxoKey = `${utxo.txHash}_${utxo.outputIndex}`;
      acc[utxoKey] = utxo;
      return acc;
    }, {} as Record<string, UTxO>)
  };
  const jsonData = JSON.stringify(dataToWrite, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2
  );

  fs.writeFileSync(filePath, jsonData, 'utf8');
}

export function runCommandInDirectory(command: string, directory: string): Promise<string> {
  return new Promise((resolve,_reject) => {
    exec(`cd ${directory} && ${command}`, (_error, stdout, _err) => {
        resolve(stdout);
    });
  });
}
/**
 * Create a collateral utxo
 * @param fromWalletSEED 
 * @param toWalletSEED 
 * @param amount 
 * @returns 
 */
export async function collateraUTxO(
  fromWalletSEED:any,
  toWalletSEED:any,
  amount:number,
):Promise<any> {
  const lucid = await initLucidBlockfrost();
  lucid.selectWallet.fromSeed(toWalletSEED);
  const toAddr = await lucid.wallet().address();

  lucid.selectWallet.fromSeed(fromWalletSEED);
 
  const txCollateral = await lucid.newTx()
  .pay.ToAddress(toAddr, { lovelace: BigInt(amount) })
  .complete().then((tx) => tx.sign.withWallet().complete())
  .then((tx) => tx.submit());
  
  await lucid.awaitTx(await txCollateral);
  const [utxo] = await lucid.utxosByOutRef([{
    txHash: txCollateral,
    outputIndex: 0
  }]
  )
  console.log("Transfer lovelace UTxO:", utxo);
  console.log("##########################################################################");
  return utxo;
}









