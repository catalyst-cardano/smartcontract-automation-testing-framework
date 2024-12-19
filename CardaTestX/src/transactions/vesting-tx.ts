import { Data, validatorToAddress } from "@lucid-evolution/lucid";
import { collateraUTxO, getScript } from "../utils/common";
import { initLucidBlockfrost } from "../utils/provider";
/**
 * build transaction
 * @param ownerSeed
 * @param datum 
 * @returns 
 */
export async function buildBeneficiaryTx(cborDatum: any,tcParams:any): Promise<string> {
  const script = await getScript(0);
  const lucid = await initLucidBlockfrost();
  lucid.selectWallet.fromSeed(tcParams.seedOwnerWallet);
  const scriptAddr = validatorToAddress("Preview", script);
  await collateraUTxO(tcParams.seedOwnerWallet,tcParams.seedBeneficiaryWallet,1000000);

  console.log("Waiting 30s................................................");
  await new Promise(resolve => setTimeout(resolve, 30000));

  //Lock asset to smart contract
  const txDeposit = await lucid
    .newTx()
    .pay.ToContract(scriptAddr, { kind: "inline", value: cborDatum }, { ["lovelace"]: 1000000n })
    .complete()
    .then((tx) => tx.sign.withWallet().complete())
    .then((tx) => tx.submit());

  await lucid.awaitTx(txDeposit);
  console.log(`1 tADA locked into the contract
Tx ID: ${txDeposit}
Datum: ${cborDatum}
`);

  console.log("Waiting 30s................................................");
  await new Promise(resolve => setTimeout(resolve, 30000));


  //Switch to beneficiary wallet
  lucid.selectWallet.fromSeed(tcParams.seedBeneficiaryWallet);
  const MAX_RETRIES = 3;
  let vestingUtxo = null;

  for (let retries = 0; retries < MAX_RETRIES; retries++) {
    const contractUTXOs = await lucid.utxosAt(scriptAddr);
    vestingUtxo = contractUTXOs.find(txo => txo.txHash === txDeposit);

    if (vestingUtxo) break;
    if (retries < MAX_RETRIES - 1) await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (!vestingUtxo) throw new Error("UTXO not found after 3 retries");

  const redeemer = Data.void();


  // unlock asset from smart contract
  const txWithdraw = await lucid
    .newTx()
    .collectFrom([vestingUtxo], redeemer)
    .attach.SpendingValidator(script)
    .addSigner(await lucid.wallet().address())
    .complete({ coinSelection: true })
    .then((tx) => tx.sign.withWallet().complete())
    .then((tx) => tx.submit());

  await lucid.awaitTx(txWithdraw);

  console.log(`1 tADA recovered from the contract
    Tx ID: ${txWithdraw}
`);
  return txWithdraw;
}

export async function buildOwnerTx(cborDatum: any,tcParams:any): Promise<string> {
  const script = await getScript(0);
  const lucid = await initLucidBlockfrost();
  lucid.selectWallet.fromSeed(tcParams.seedOwnerWallet);
  const scriptAddr = validatorToAddress("Preview", script);
  await collateraUTxO(tcParams.seedOwnerWallet,tcParams.seedOwnerWallet,1000000);

  console.log("Waiting 30s................................................");
  await new Promise(resolve => setTimeout(resolve, 30000));

  //Lock asset to smart contract
  const txDeposit = await lucid
    .newTx()
    .pay.ToContract(scriptAddr, { kind: "inline", value: cborDatum }, { ["lovelace"]: 1000000n })
    .complete({ coinSelection: true })
    .then((tx) => tx.sign.withWallet().complete())
    .then((tx) => tx.submit());

  await lucid.awaitTx(txDeposit);
  console.log(`1 tADA locked into the contract
Tx ID: ${txDeposit}
Datum: ${cborDatum}
`);

  console.log("Waiting 30s................................................");
  await new Promise(resolve => setTimeout(resolve, 30000));

  const MAX_RETRIES = 3;
  let vestingUtxo = null;

  for (let retries = 0; retries < MAX_RETRIES; retries++) {
    const contractUTXOs = await lucid.utxosAt(scriptAddr);
    vestingUtxo = contractUTXOs.find(txo => txo.txHash === txDeposit);

    if (vestingUtxo) break;
    if (retries < MAX_RETRIES - 1) await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (!vestingUtxo) throw new Error("UTXO not found after 3 retries");

  const redeemer = Data.void();

  // unlock asset from smart contract
  const txWithdraw = await lucid
    .newTx()
    .collectFrom([vestingUtxo], redeemer)
    .attach.SpendingValidator(script)
    .addSigner(await lucid.wallet().address())
    .complete({ coinSelection: true })
    .then((tx) => tx.sign.withWallet().complete())
    .then((tx) => tx.submit());

  await lucid.awaitTx(txWithdraw);

  console.log(`1 tADA recovered from the contract
    Tx ID: ${txWithdraw}
`);
  return txWithdraw;
}
