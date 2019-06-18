//JS has no sha256 encryption, so we require it, to encrypt our blocks with it

const SHA256 = require("crypto-js/sha256");

//the class block creates the bock object which is the basis to what a transaction should translate ; source https://www.savjee.be/2017/07/Writing-tiny-blockchain-in-JavaScript/

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = this.calculateHash();
        this.nonce = 0;

    }

//here is the factory which produces the hashes for our blocks. it created the hash attribute for the block object
    calculateHash() {
        return SHA256(this.index +
            this.previousHash +
            this.timestamp +
            JSON.stringify(this.data) +
            this.nonce
        ).toString();
    }
/*
this decides on the difficulty to avoid spamming the chain.
it loops through the hashes and searches for hashes corresponding to one starting with
specified amounts of 0s. So if the difficulty is "4" the hash has to start with "0000"
This is also referred to as the "Proof of Work".
 */

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("BLOCK MINED: " + this.hash);
    }

}

//this class constructs the chain itself and ties the blocks together and makes them immutable.
//TODO the blockchain needs to be distributed and copied to all participants of a transactional space
class Blockchain{
    constructor() {
        this.chain = [this.createGenesisBlock()]; //TODO make genesis block uncorruptable
        this.difficulty = 4; //here you can set the difficulty. Increasing it will lead to a longer waiting time until a block is created
    }
    //we create a genesis block. the genesis block is always the first entry of a blockchain. genesis as naming, is only taken by convention
    createGenesisBlock() {
        return new Block (0, "01/01/2017", "Genesis block", "0") //TODO this can be manipulated - needs to be tackled. Ask what to do about it
    }
    //we go back in the blockchain one step to know the latest "active" block
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }
    //and then we add a new one bases on the latest one

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        //newBlock.hash = newBlock.calculateHash(); Deprecated if you mine the blocks
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }
    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash() ) {
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }

        }
        return true;
    }
}

//add test entries to blockchain
//TODO make these (User) InPuts
let trivagoBC = new Blockchain();
console.log('Mining block 1...');
trivagoBC.addBlock(new Block(1, "01/01/2019", { amount: 4 }));
console.log('Mining block 2...');
trivagoBC.addBlock(new Block(2, "01/01/2019", { amount: 8 }));

console.log(JSON.stringify(trivagoBC, null, 4));
console.log("is Chain valid? " + trivagoBC.isChainValid());

//Attempt to manipulate data of an existing indexed entry
trivagoBC.chain[1].data = { amount: 16 };
trivagoBC.chain[1].hash = trivagoBC.chain[1].calculateHash();

// Check our chain again (will now return false)
console.log("Blockchain valid? " + trivagoBC.isChainValid());
