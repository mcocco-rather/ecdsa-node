import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import { hexToBytes } from "ethereum-cryptography/utils";

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

function Wallet({
  address,
  setAddress,
  balance,
  setBalance,
  privateKey,
  setPrivateKey,
}) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const publicKey = secp.getPublicKey(privateKey);
    const address = toAddress(publicKey);
    setAddress(address);
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input
          placeholder="Type in a private key, for example: 0x1"
          value={privateKey}
          onChange={onChange}
        ></input>
      </label>

      <div> Address: {address}</div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
