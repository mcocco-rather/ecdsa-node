const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes } = require("ethereum-cryptography/utils");

for (let i = 0; i < 3; i++) {
  console.log(`Account ${i + 1}:`);
  const privateKey = secp.utils.randomPrivateKey();

  console.log("private key: ", toHex(privateKey));

  const publicKey = secp.getPublicKey(privateKey);

  console.log("public key", toHex(publicKey));

  // Remove leading "04"
  const pubKeyBytes = hexToBytes(toHex(publicKey).slice(2));

  // Keccak-256 hash of the public key
  const hash = keccak256(pubKeyBytes);

  // Ethereum address = last 20 bytes of the hash
  const addressBytes = hash.slice(-20);

  // Convert to hex string with "0x" prefix
  const addressHex = "0x" + Buffer.from(addressBytes).toString("hex");
  console.log("Ethereum address:", addressHex);

  console.log("");
}
