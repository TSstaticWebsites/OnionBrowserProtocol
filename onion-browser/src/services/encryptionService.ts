import { TorNode, Circuit, EncryptedPackage } from '../types/tor';

export class EncryptionService {
  private static async generateKeyPair(): Promise<CryptoKeyPair> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  private static async encryptForNode(data: ArrayBuffer, publicKey: CryptoKey): Promise<ArrayBuffer> {
    return await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      data
    );
  }

  public static async buildCircuit(circuit: Circuit, payload: ArrayBuffer): Promise<EncryptedPackage> {
    // Layer 3: Encrypt for exit node
    let encryptedData = await this.encryptForNode(payload, circuit.exit.publicKey);

    // Layer 2: Encrypt for middle node
    const middlePackage = {
      data: encryptedData,
      nextNode: circuit.exit.id
    };
    encryptedData = await this.encryptForNode(
      new TextEncoder().encode(JSON.stringify(middlePackage)),
      circuit.middle.publicKey
    );

    // Layer 1: Encrypt for entry node
    const entryPackage = {
      data: encryptedData,
      nextNode: circuit.middle.id
    };
    encryptedData = await this.encryptForNode(
      new TextEncoder().encode(JSON.stringify(entryPackage)),
      circuit.entry.publicKey
    );

    return {
      data: encryptedData,
      nextNode: circuit.entry.id
    };
  }
}
