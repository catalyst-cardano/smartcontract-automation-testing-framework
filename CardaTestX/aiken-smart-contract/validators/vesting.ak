use aiken/collection/list
use cardano/transaction.{OutputReference, Transaction}

pub type VestingDatum {
  owner: ByteArray,
  beneficiary: ByteArray,
}

validator vesting {
  spend(
    datum_opt: Option<VestingDatum>,
    _redeemer: Data,
    _input: OutputReference,
    tx: Transaction,
  ) {
    expect Some(datum) = datum_opt
    or {
      list.has(tx.extra_signatories, datum.owner),
      list.has(tx.extra_signatories, datum.beneficiary),
    }
  }

  else(_) {
    fail
  }
}
