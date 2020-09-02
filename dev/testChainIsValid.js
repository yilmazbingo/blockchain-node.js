const Blockchain = require("./blockchain");

const bitcoin = new Blockchain();

const bc = {
  chain: [
    {
      index: 1,
      timestamp: 1586298645633,
      transactions: [],
      nonce: 100,
      hash: "0",
      previousBlockHash: "0",
    },
    {
      index: 2,
      timestamp: 1586298662786,
      transactions: [],
      nonce: 18140,
      hash: "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
      previousBlockHash: "0",
    },
    {
      index: 3,
      timestamp: 1586298785229,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "9ea8f8d100ad48389c2a4d06c25cc65a",
          transactionId: "54423b3b-e169-460b-bf84-da1e77ec09b4",
        },
        {
          amount: 1600,
          sender: "dsdkdskdks",
          recipient: "ddsd",
          transactionId: "cb77fc90-eb06-46d7-b131-a74dd303f9a2",
        },
        {
          amount: 1600,
          sender: "dsdkdskdks",
          recipient: "ddsd",
          transactionId: "592d40f1-1a96-42c9-bcdb-73969efa0018",
        },
        {
          amount: 1600,
          sender: "dsdkdskdks",
          recipient: "ddsd",
          transactionId: "9ae76162-c89e-4fad-8d36-acb96de9385e",
        },
        {
          amount: 1600,
          sender: "dsdkdskdks",
          recipient: "ddsd",
          transactionId: "d84fd568-2e09-4185-817b-8a93140040fe",
        },
        {
          amount: 1600,
          sender: "dsdkdskdks",
          recipient: "ddsd",
          transactionId: "57972f9a-c347-4daa-9f6c-e2877678f48d",
        },
      ],
      nonce: 63118,
      hash: "0000963fa626fa44bac01f1af437d7bc1ade90eb675886b8a37c77ca8c145265",
      previousBlockHash:
        "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
    },
    {
      index: 4,
      timestamp: 1586298804005,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "9ea8f8d100ad48389c2a4d06c25cc65a",
          transactionId: "2bdd3a72-80bb-451e-bf63-d44183e89df9",
        },
        {
          amount: 1600,
          sender: "dsdkdskdks",
          recipient: "ddsd",
          transactionId: "5d947a4e-886a-410a-a87b-6e965af2d1a6",
        },
        {
          amount: 1600,
          sender: "dsdkdskdks",
          recipient: "ddsd",
          transactionId: "6be4624a-84b0-4d12-abb4-479e7b882200",
        },
      ],
      nonce: 47922,
      hash: "000007bb21fc80ebe7f08c67059dee393e29956fe12a351e4c3d0d7f58896ef9",
      previousBlockHash:
        "0000963fa626fa44bac01f1af437d7bc1ade90eb675886b8a37c77ca8c145265",
    },
    {
      index: 5,
      timestamp: 1586298832042,
      transactions: [
        {
          amount: 12.5,
          sender: "00",
          recipient: "9ea8f8d100ad48389c2a4d06c25cc65a",
          transactionId: "6e251756-2d01-43be-8d91-cb9e52c9ae5f",
        },
      ],
      nonce: 31811,
      hash: "0000aadfb1ea03d5f41c62939d250078a7edab42b152f82e40070a859b47a18c",
      previousBlockHash:
        "000007bb21fc80ebe7f08c67059dee393e29956fe12a351e4c3d0d7f58896ef9",
    },
  ],
  pendingTransactions: [
    {
      amount: 12,
      sender: "0",
      recipient: "9ea8f8d100ad48389c2a4d06c25cc65a",
      transactionId: "5b60450c-cd0e-45d5-a94f-31da049c381b",
    },
  ],
  currentNodeUrl: "http://localhost:3002",
  networkNodes: [],
};

//it does not check the last pending transaction. just checking the blocks
// console.log(bitcoin.chainIsValid(bc.chain));

// const a = bc.chain.find((chain) => (chain.index = 2));
// const b = bc.chain.forEach((chain) => {
//   // console.log(chain);
//   if (chain.index === "2") {
//     return chain;
//   }
// });
// console.log(b);
