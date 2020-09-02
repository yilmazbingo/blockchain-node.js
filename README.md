# Bitcoin--Blockchain
Node.js Blockchain Project



**Install Postman in linux**
- download from "https://www.postman.com/downloads/"
- navigate to the folder and extract the folder
```
sudo rm -rf /opt/Postman/
sudo tar xvf Postman-linux-x64-7.31.1.tar.gz  -C /opt/
sudo ln -sf /opt/Postman/app/Postman /usr/bin/postman
```
- now create a desktop icon
```
nano ~/.local/share/applications/postman.desktop
```
paste the following
```
[Desktop Entry]
	Encoding=UTF-8
	Name=Postman
	X-GNOME-FullName=Postman API Client
	Exec=/usr/bin/postman
	Icon=/opt/Postman/app/resources/app/assets/icon.png
	Terminal=false
	Type=Application
	Categories=Development;
```
**Block Explorer**
- http://localhost:3001/block-explorer

### Proof Of Work
- To hash a block, we put the string of previous block's hash value and curret block's data into the [sha256](https://www.npmjs.com/package/sha256) function as arguments. 
 
      const sha256 = require("sha256");

      Blockchain.prototype.hashBlock = function(previousBlockHash,currentBlockData,nonce) {
      const dataAsString =previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
      const hash = sha256(dataAsString);
      return hash;
    };
    
Proof of work algorithm is to find the hash that meets a certain criteria. In Bitcoin, hashing value should start with "0000................." (64 characters) So in blockchain, previous hash value and data inside the block are immutable. so if we use the same data, sha256 function would produce same hash value. In order to tweak this hash value we use **nonce**. nonce means nonsense. It's job is so simple, if current hash value does not meet the criteria, it will increase by one, and hash function will run again with new nonce value till the criteria is met.

            Blockchain.prototype.proofOfWork = function(previousBlockHash,currentBlockData) {
            let nonce = 0;
            let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
            while (hash.substring(0, 4) !== "0000") {
              nonce++;
              hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
              console.log(hash);
            }
            //nonce is our proof
            return nonce;
          };
          
 Return value of this method is nonce and **nonce is our proof of the work.** It basically gives you the number of iterations to reach "0000.........". 
 
### Genesis Block
it is the first block in the block chain. we want this block to be created right when we create our blockchain. 

      function Blockchain() {
        this.chain = [];
        this.pendingTransactions = [];
        this.createNewBlock(100, "0", "0");// arguments can be any value.
      }

 ## Create Decentralized Network
 - We want to run our server on 5 different ports so each server will act as different network node.
 
 ##### process.argv
   This is an aray that contains the command line arguments. First element will be node and its options, second will be the name of the javascript file that being executed. The next elements will be any additional command line arguments that we define. 
     
      "start": "nodemon --watch dev -e js dev/networkNode.js"
`process.argv[0]`= "nodemon --watch dev -e js"
`process.argv[1]`= "dev/networkNode.js"
we are gonna define 3rd argument as port and 4 argument will be the current url of the node. So each node will be aware of their url address.

       "start": "npm-run-all --parallel node:* ",
       "node:1": "nodemon --watch dev -e js dev/networkNode.js 3001 http://localhost:3001",
       "node:2": "nodemon --watch dev -e js dev/networkNode.js 3002 http://localhost:3002",
       "node:3": "nodemon --watch dev -e js dev/networkNode.js 3003 http://localhost:3003",
       "node:4": "nodemon --watch dev -e js dev/networkNode.js 3004 http://localhost:3004",
       "node:5": "nodemon --watch dev -e js dev/networkNode.js 3005 http://localhost:3005"
 
 [npm-run-all](https://www.npmjs.com/package/npm-run-all) helps run all other servers parallel. 
  
           const port = process.argv[2];

           const currentNodeUrl = process.argv[3];
           function Blockchain() {
             this.chain = [];
             this.pendingTransactions = [];
             this.currentNodeUrl = currentNodeUrl;
             this.networkNodes = [];
             this.createNewBlock(100, "0", "0");
           }
   
   Now we need to connect those 5 different nodes. 
 
 

