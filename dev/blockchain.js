const sha256 = require("sha256");
const { v4: uuidv4 } = require("uuid");


const currentNodeUrl = process.argv[3];

function Blockchain() {
  this.chain = [];
  this.pendingTransactions = [];
  this.currentNodeUrl = currentNodeUrl;
  // we post a new node to "/register-and-broadcast"
  this.networkNodes = [];
  this.createNewBlock(100, "0", "0");
}

//--------------------------CREATE A NEW BLOCK--------------------------------
Blockchain.prototype.createNewBlock = function (
  nonce,
  previousBlockHash,
  hash
) {
  const newBlock = {
    index: this.chain.length + 1,
    timestamp: Date.now(),
    transactions: this.pendingTransactions,
    nonce: nonce,
    hash: hash,
    previousBlockHash: previousBlockHash,
  };
  //after we mine the block, we cleared up the pendingTransactions[]
  this.pendingTransactions = [];
  this.chain.push(newBlock);
  return newBlock;
};

//---------------------------GET THE LAST BLOCK------------------------------------------

Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
};

//------------------------CREATE A NEW TRANSACTION ------------------------------
// Blockchain.prototype.createNewTransaction = function(
//   amount,
//   sender,
//   recipient
// ) {
//   const newTransaction = {
//     amount,
//     sender,
//     recipient
//   };
//   this.pendingTransactions.push(newTransaction);
//   //return the number of the Block that newTransaction has been added to
//   return this.getLastBlock()["index"] + 1;
// };
//-----------------------split the above cod
Blockchain.prototype.createNewTransaction = function (
  amount,
  sender,
  recipient
) {
  const newTransaction = {
    amount,
    sender,
    recipient,
    transactionId: uuidv4().split("-").join(""),
  };
// uuidv4() format c7160c09-a613-4743-ad8b-051be297d32d

  return newTransaction;
};

Blockchain.prototype.addTransactionToPendingTransaction = function (
  transactionObj
) {
  this.pendingTransactions.push(transactionObj);
  return this.getLastBlock()["index"] + 1;
};

//----------------------HASH THE BLOCK ---------------------------------------
Blockchain.prototype.hashBlock = function (
  previousBlockHash,
  currentBlockData,
  nonce
) {
  const dataAsString =
    previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
  const hash = sha256(dataAsString);
  return hash;
};

//--------------------------PROOF OF WORK -------------------------------------
Blockchain.prototype.proofOfWork = function (
  previousBlockHash,
  currentBlockData
) {
  let nonce = 0;
  let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
  while (hash.substring(0, 4) !== "0000") {
    nonce++;
    hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    // console.log(hash);
  }
  //nonce is our proof
  return nonce;
};

//------------CONSENSUS ALGORITHM--------------
Blockchain.prototype.chainIsValid = function (blockchain) {
  let validChain = true;
  //---------skipping the GENESIS BLOCK
  //because GENESIS BLOCK  is mined without proof of work
  for (let i = 1; i < blockchain.length; i++) {
    const currentBlock = blockchain[i];
    const prevBlock = blockchain[i - 1];

    const currentBlockData = {
      transactions: currentBlock["transactions"],
      index: currentBlock["index"],
    };
    const blockHash = this.hashBlock(
      prevBlock["hash"],
      currentBlockData,
      currentBlock["nonce"]
    );
    if (blockHash.substring(0, 4) !== "0000") validChain = false;
    if (currentBlock["previousBlockHash"] !== prevBlock["hash"])
      validChain = false;
  }

  // ---------- VALIDATING GENESIS BLOCK-------
  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock["nonce"] === 100;
  const correctPreviosBlockHash = genesisBlock["previousBlockHash"] === "0";
  const correctCurrentBlockHash = genesisBlock["hash"] === "0";
  const correctTransactions = genesisBlock["transactions"].length === 0;
  if (
    !correctNonce ||
    !correctPreviosBlockHash ||
    !correctCurrentBlockHash ||
    !correctTransactions
  )
    validChain = false;
  return validChain;
};

//-------------------------------BLOCK EXPLORER------------------------------
Blockchain.prototype.getBlock = function (blockHash) {
  return this.chain.find((block) => block.hash === blockHash);
};

Blockchain.prototype.getTransaction = function (transactionId) {
  let correctTransaction = null;
  let correctBlock = null;
  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      if (transaction.transactionId === transactionId) {
        correctTransaction = transaction;
        correctBlock = block;
      }
    });
  });
  return { transaction: correctTransaction, block: correctBlock };
};

//------------------------CALCULATING THE BALANCE----------------------
Blockchain.prototype.getAddressData = function (address) {
  const addressTransactions = [];
  //first we are taking all the transactions that given address involved
  this.chain.forEach((block) => {
    block.transactions.forEach((transaction) => {
      if (transaction.sender === address || transaction.recipient === address) {
        addressTransactions.push(transaction);
      }
    });
  });
  let balance = 0;
  addressTransactions.forEach((transaction) => {
    if (transaction.recipient === address) balance += transaction.amount;
    else if (transaction.sender === address) balance -= transaction.amount;
  });
  return {
    addressTransactions: addressTransactions,
    addressBalance: balance,
  };
};

module.exports = Blockchain;
