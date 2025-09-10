import { useState } from "react";
import server from "./server";

import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes } from "ethereum-cryptography/utils";

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
    recovery,
  };
}

function Transfer({ privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      const amount = parseInt(sendAmount);
      // Create a simple, canonical message to sign
      const message = JSON.stringify({ amount, recipient });

      const { msgHash, signature, recovery } = await signMessage(
        message,
        privateKey
      );

      const {
        data: { balance },
      } = await server.post(`send`, {
        amount,
        message,
        signature,
        recovery,
      });
      console.log({ message, msgHash, signature, recovery });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
