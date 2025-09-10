import express from "express";
import cors from "cors";

import * as secp from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { toHex, utf8ToBytes, hexToBytes } from "ethereum-cryptography/utils.js";

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0xb6d48d32555a2325432677fb51a44d30e27133da": 100,
  "0x9f2aa59afda448578bd2388a443013e2bcc0fe89": 50,
  "0xfb7cd6aa8f74f775658ab7973839b0a9490511c6": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

function toAddress(publicKey) {
  // Remove leading "04"
  const pubKeyBytes = hexToBytes(toHex(publicKey).slice(2));
  const publicKeyHash = keccak256(pubKeyBytes);
  // Ethereum address = last 20 bytes of the hash
  const addressBytes = publicKeyHash.slice(-20);
  // Convert to hex string with "0x" prefix
  const addressHex = "0x" + toHex(addressBytes);
  return addressHex;
}

function recoverAddress(message, signature, recovery) {
  const recoveredPublicKey = secp.recoverPublicKey(
    keccak256(utf8ToBytes(message)),
    signature,
    recovery
  );
  return toAddress(recoveredPublicKey);
}

app.post("/send", (req, res) => {
  const { amount, message, signature, recovery } = req.body;
  console.log(message);
  const { recipient } = JSON.parse(message);
  const sender = recoverAddress(message, signature, recovery);
  console.log({ sender });

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
