import { Blockfrost, Lucid } from "@lucid-evolution/lucid";

const { NETWORK, PROJECT_ID, URL_BLOCKFROST,} = process.env;

export async function initLucidBlockfrost() {
  const provider = new Blockfrost(URL_BLOCKFROST!, PROJECT_ID)
  const lucid = await Lucid(provider, NETWORK);
  return lucid;
}
