const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const rp = require("request-promise");
const Blockchain = require("./blockchain");
const { v4: uuidv4 } = require("uuid");

const nodeAddress = uuidv4().split("-").join("");
const bitcoin = new Blockchain();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blockchain", (req, res) => {
  res.send(bitcoin);
});

// -----1----REGISTER A NODE AND BROADCAST IT TO THE NETWORK-------1------
// this is a random node where the new node requests to join
// once the random node accepts the new node, it broadcasts it to other nodes 
app.post("/register-and-broadcast", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1) {
    bitcoin.networkNodes.push(newNodeUrl);
  }
  const regNodesPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl },
      json: true,
    };
    regNodesPromises.push(rp(requestOptions));
  });
  // we are sending the list of all nodes in the blockchain to the new node
  // attention to the ------"URI:newNodeUrl"----
  Promise.all(regNodesPromises)
    .then((data) => {
      console.log("data returned from registeredNodesPromises",data)
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-nodes-bulk",
        method: "POST",
        body: {
          allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl],
        },
        json: true,
      };
      return rp(bulkRegisterOptions);
    })
    .then((data) => res.json({ note: "new node is registered" }))
    .catch((e) => console.log(e));

  // now broadcast it to other nodes
});

// Random node above will broadcast the new registration to all of other nodes in the network
// Except the new registered Node.
app.post("/register-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode)
    bitcoin.networkNodes.push(newNodeUrl);

  res.json({ node: "new node registered with network" });
});

// will register multiple nodes at once to the New Registered Node
// this endpoint will be hit only once when the Node Joined to the network
// once the new node registered, it receives the list of all other nodes
app.post("/register-nodes-bulk", (req, res) => {
  const allNetworkNodes = req.body.allNetworkNodes;
  //now we need to loop through each adn register
  allNetworkNodes.forEach((networkNodeUrl) => {
    const nodeNotAlreadyPresent =
      bitcoin.networkNodes.indexOf(networkNodeUrl) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode)
      bitcoin.networkNodes.push(networkNodeUrl);
  });
  res.json({ note: "Bulk registration is successfull" });
});

// ------2------CREATE TRANSACTION AND BROADCAST-----2------
// we need to add transactions first to mine
app.post("/transaction", function (req, res) {
  const newTransaction = req.body;
  const blockIndex = bitcoin.addTransactionToPendingTransaction(newTransaction);
  res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

// each pool has the same Transaction-Pool
// in real life, this is the wallet that receives the incoming transaction
app.post("/transaction/broadcast", function (req, res) {
  const newTransaction = bitcoin.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );
  bitcoin.addTransactionToPendingTransaction(newTransaction);
  const requestPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/transaction",
      method: "POST",
      body: newTransaction,
      json: true,
    };
    requestPromises.push(rp(requestOptions));
  });
  // Promise.all() returns array
  // each request is made to "/transaction" and its return value be returned
  Promise.all(requestPromises)
    .then((data) => {
      res.json({ note: "Transaction created and broadcast successfully." ,data});
    })
    .catch((e) => console.log(e));
});

//-------------------MINE THE PENDING TRANSACTIONS AND BROADCAST--------------------
app.get("/mine", function (req, res) {
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock["hash"];
  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock["index"] + 1,
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(
    previousBlockHash,
    currentBlockData,
    nonce
  );
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
  const requestPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/receive-new-block",
      method: "POST",
      body: { newBlock: newBlock },
      json: true,
    };
    requestPromises.push(rp(requestOptions));
  });
// broadcasting the Reward Coin=coinbase transaction
  Promise.all(requestPromises)
    .then((data) => {
      const requestOptions = {
        uri: bitcoin.currentNodeUrl + "/transaction/broadcast",
        method: "POST",
        body: {
          amount: 12.5,
          sender: "00",
          recipient: nodeAddress,
        },
        json: true,
      };

      return rp(requestOptions);
    })
    .then((data) => {
      res.json({
        note: "New block mined & broadcast successfully",
        block: newBlock,
      });
    })
    .catch((e) => alert(e));
});

//---------------RECEIVING NEW BLOCK---------
app.post("/receive-new-block", (req, res) => {
  const newBlock = req.body.newBlock;
  //first we need to check if the block is legitimite
  const lastBlock = bitcoin.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock["index"] + 1 === newBlock["index"];
  if (correctHash && correctIndex) {
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTransactions = [];
    res.json({ note: "new block received and accepted", newBlock });
  } else {
    res.json({ note: "new block rejected", newBlock });
  }
});


//---------------------CONSENSUS--------------------
app.get("/consensus", (req, res) => {
  let requestPromises = [];
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const options = {
      uri: networkNodeUrl + "/blockchain",
      method: "GET",
      json: true,
    };
    requestPromises.push(rp(options));
  });
  Promise.all(requestPromises).then((blockchains) => {
    const currentChainLength = bitcoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;
    blockchains.forEach((blockchain) => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });
    //if there is no new chain or if there is but not valid
    if (
      !newLongestChain ||
      (newLongestChain && !bitcoin.chainIsValid(newLongestChain))
    ) {
      res.json({
        note: "Current chain has not been replaced",
        chain: bitcoin.chain,
      });
    } else if (newLongestChain && bitcoin.chainIsValid(newLongestChain)) {
      bitcoin.chain = newLongestChain;
      bitcoin.pendingTransactions = newPendingTransactions;
      res.json({
        note: "this chain has been replaced",
        chain: bitcoin.chain,
      });
    }
  });
});

//---------------------------BLOCK EXPLORER----------------
app.get("/block/:blockHash", (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = bitcoin.getBlock(blockHash);
  res.json({
    block: correctBlock,
  });
});

app.get("/transaction/:transactionId", (req, res) => {
  const transactionId = req.params.transactionId;
  const transactionData = bitcoin.getTransaction(transactionId);

  res.json({
    transaction: transactionData.transaction,
    block: transactionData.block,
  });
});

//---------TRANSACTIONS THAT HAVE BEEN MADE TO THIS ADDRESS----------------
app.get("/address/:address", (req, res) => {
  const address = req.params.address;
  const addressData = bitcoin.getAddressData(address);
  res.json({ addressData: addressData });
});

app.get("/block-explorer", (req, res) => {
  res.sendFile("./blockExplorer/index.html", { root: __dirname });
});


const port = process.argv[2];
// process.argv [ '/usr/bin/node',
//   '/home/tesla/Documents/projects/blockchain/node.js/dev/networkNode.js',
//   '3005',
//   'http://localhost:3005' ]


app.listen(port, () => {
  console.log(`server is listening on ${port}`);
});
