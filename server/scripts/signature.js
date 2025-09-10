import * as secp from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { toHex, utf8ToBytes } from "ethereum-cryptography/utils.js";

async function signMessage(message, privateKey) {
  // Hash the message deterministically and sign it
  const msgHash = keccak256(utf8ToBytes(message));
  const [signature, recovery] = await secp.sign(msgHash, privateKey, {
    recovered: true,
  });
  // Return everything serialized for transport
  return {
    msgHash: toHex(msgHash),
    signature: toHex(signature),
    recovery: recovery,
  };
}

const amount = 10;
const recipient = "0xfb7cd6aa8f74f775658ab7973839b0a9490511c6";
const privateKey =
  "e6e9612e0a5292344bba807f37a9c01fa56c537ad85c3457803826148993169b";
const message = JSON.stringify({ amount, recipient });

const { msgHash, signature, recovery } = await signMessage(message, privateKey);
console.log("Message:", message);
console.log("Message hash:", msgHash);
console.log("Signature:", signature);
console.log("Recovery bit:", recovery);
