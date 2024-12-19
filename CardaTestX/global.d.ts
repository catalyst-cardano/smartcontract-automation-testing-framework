import type { Network } from 'lucid-cardano';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      NETWORK: Network;
      PROJECT_ID: string;
      URL_GET_CLUB_CONFIG: string;
      PROVIDER: string;
      SEED_OWNER_WALLET: string;
      SEED_BENEFICIARY_WALLET: string;
      OWNER_ADDR:string;
      BENEFICIARY_ADDR:string;
      SUITE_PATH: string;
      TEST_DATA_PATH:string;
      TEST_CASE_PATH:string;
      TEST_CASE_FIELDS:string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
