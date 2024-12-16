import { Circuit, EncryptedPackage } from '../types/tor';

export class EncryptionService {
  private static async stringToPublicKey(keyString: string): Promise<CryptoKey> {
    // For mock implementation, create a temporary key pair
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'wrapKey'] // Added proper key usages
    );
    return keyPair.publicKey;
  }

  private static async encryptForNode(data: ArrayBuffer, publicKeyString: string): Promise<ArrayBuffer> {
    const publicKey = await this.stringToPublicKey(publicKeyString);
    return await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      data
    );
  }

  public static async buildCircuit(circuit: Circuit, payload: ArrayBuffer): Promise<EncryptedPackage> {
    // Layer 3: Encrypt for exit node
    let encryptedData = await this.encryptForNode(payload, circuit.exit.public_key);

    // Layer 2: Encrypt for middle node
    const middlePackage = {
      data: encryptedData,
      nextNode: circuit.exit.id
    };
    encryptedData = await this.encryptForNode(
      new TextEncoder().encode(JSON.stringify(middlePackage)),
      circuit.middle.public_key
    );

    // Layer 1: Encrypt for entry node
    const entryPackage = {
      data: encryptedData,
      nextNode: circuit.middle.id
    };
    encryptedData = await this.encryptForNode(
      new TextEncoder().encode(JSON.stringify(entryPackage)),
      circuit.entry.public_key
    );

    return {
      data: encryptedData,
      nextNode: circuit.entry.id
    };
  }
}
