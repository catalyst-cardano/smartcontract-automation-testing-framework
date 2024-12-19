import { isValidTxHash} from "../../utils/common";
import { expect, test,beforeEach, afterEach } from "bun:test";
import { Data } from "@lucid-evolution/lucid";
import {buildOwnerTx} from "../../transactions/vesting-tx";
import {buildBeneficiaryTx} from "../../transactions/vesting-tx";


beforeEach(() => {
console.log("#====================Running test===========================#");
});

afterEach(async () => {
console.log("#====================Ending test===========================#");
console.log("Waiting 30s................................................");
 await new Promise(resolve => setTimeout(resolve, 30000));
});



/**
* TestID:TC-001
* Test title:[Success] Unclock successfully with valid owner signature
* Expected Results:true
*/
test(
"[Test] - [TC-001][Success] Unclock successfully with valid owner signature",
async () =>{
console.log("#========TC-001:[Success] Unclock successfully with valid owner signature=========#");
const DatumLockSchema= Data.Object({
  datum_owner: Data.Bytes(),
  datum_beneficiary: Data.Bytes(),
});
type DatumLock = Data.Static<typeof DatumLockSchema>;
const DatumLock = DatumLockSchema as unknown as DatumLock;
const datum = Data.to<DatumLock>(
{
datum_owner:"f180cb9acbc60038f7965323a0ac16cc605e12b7b2bf75c6acf817b1",
datum_beneficiary:"fa255bbe2e329fbe8b8486e832e43ba5ae945d909f2fdf2f668c44f2",
},
DatumLock
);
const testData={
		"seedOwnerWallet": "key action sheriff salmon front clock useful ocean stick pepper train fiction capable bright benefit rib dune thunder wreck direct dial siren iron spend",
		"seedBeneficiaryWallet": "curtain use picnic oxygen welcome bargain future thunder heart gloom produce worry catalog miracle behave blast inner despair winter chest dolphin pottery list gate",
		"datum_owner": "f180cb9acbc60038f7965323a0ac16cc605e12b7b2bf75c6acf817b1",
		"datum_beneficiary": "fa255bbe2e329fbe8b8486e832e43ba5ae945d909f2fdf2f668c44f2"

	}
const tx = await buildOwnerTx(datum,testData);
const isExpectedResult=true;
const isActualResult=isValidTxHash(tx);
console.log("isExpectedResult:",isExpectedResult);
console.log("isActualResult:",isActualResult);
expect(isActualResult).toEqual(isExpectedResult);
},6000000);


/**
* TestID:TC-002
* Test title:[Success] Unclock successfully with valid beneficiary signature
* Expected Results:true
*/
test(
"[Test] - [TC-002][Success] Unclock successfully with valid beneficiary signature",
async () =>{
console.log("#========TC-002:[Success] Unclock successfully with valid beneficiary signature=========#");
const DatumLockSchema= Data.Object({
  datum_owner: Data.Bytes(),
  datum_beneficiary: Data.Bytes(),
});
type DatumLock = Data.Static<typeof DatumLockSchema>;
const DatumLock = DatumLockSchema as unknown as DatumLock;
const datum = Data.to<DatumLock>(
{
datum_owner:"f180cb9acbc60038f7965323a0ac16cc605e12b7b2bf75c6acf817b1",
datum_beneficiary:"fa255bbe2e329fbe8b8486e832e43ba5ae945d909f2fdf2f668c44f2",
},
DatumLock
);
const testData={
		"seedOwnerWallet": "key action sheriff salmon front clock useful ocean stick pepper train fiction capable bright benefit rib dune thunder wreck direct dial siren iron spend",
		"seedBeneficiaryWallet": "curtain use picnic oxygen welcome bargain future thunder heart gloom produce worry catalog miracle behave blast inner despair winter chest dolphin pottery list gate",
		"datum_owner": "f180cb9acbc60038f7965323a0ac16cc605e12b7b2bf75c6acf817b1",
		"datum_beneficiary": "fa255bbe2e329fbe8b8486e832e43ba5ae945d909f2fdf2f668c44f2"

	}
const tx = await buildBeneficiaryTx(datum,testData);
const isExpectedResult=true;
const isActualResult=isValidTxHash(tx);
console.log("isExpectedResult:",isExpectedResult);
console.log("isActualResult:",isActualResult);
expect(isActualResult).toEqual(isExpectedResult);
},6000000);
