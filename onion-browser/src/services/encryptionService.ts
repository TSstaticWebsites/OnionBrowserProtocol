import { Circuit, EncryptedPackage } from '../types/tor';

export class EncryptionService {
  private static async stringToPublicKey(keyString: string): Promise<CryptoKey> {
    // For mock implementation, generate a proper RSA key pair
    const algorithm = {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: 'SHA-256' },
    };

    try {
      const keyPair = await window.crypto.subtle.generateKey(
        algorithm,
        true,
        ['encrypt', 'decrypt']  // Both usages required for RSA-OAEP key generation
      );

      // Export the public key to verify it's properly initialized
      await window.crypto.subtle.exportKey('spki', keyPair.publicKey);

      return keyPair.publicKey;
    } catch (error) {
      console.error('Error generating key pair:', error);
      throw error;
    }
  }

  private static async encryptForNode(data: ArrayBuffer, publicKeyString: string): Promise<ArrayBuffer> {
    try {
      const publicKey = await this.stringToPublicKey(publicKeyString);
      return await window.crypto.subtle.encrypt(
        {
          name: 'RSA-OAEP'
        },
        publicKey,
        data
      );
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw error;
    }
  }

  public static async buildCircuit(circuit: Circuit, payload: ArrayBuffer): Promise<EncryptedPackage> {
    try {
      const encryptedLayers: ArrayBuffer[] = [];

      // Layer 3: Encrypt for exit node
      let encryptedData = await this.encryptForNode(payload, circuit.exit.public_key);
      encryptedLayers.push(encryptedData);

      // Layer 2: Encrypt for middle node
      const middlePackage = {
        data: encryptedData,
        next_hop: circuit.exit.id
      };
      encryptedData = await this.encryptForNode(
        new TextEncoder().encode(JSON.stringify(middlePackage)),
        circuit.middle.public_key
      );
      encryptedLayers.push(encryptedData);

      // Layer 1: Encrypt for entry node
      const entryPackage = {
        data: encryptedData,
        next_hop: circuit.middle.id
      };
      encryptedData = await this.encryptForNode(
        new TextEncoder().encode(JSON.stringify(entryPackage)),
        circuit.entry.public_key
      );
      encryptedLayers.push(encryptedData);

      return {
        data: encryptedLayers.reverse(), // Reverse to get entry->middle->exit order
        next_hop: circuit.entry.id
      };
    } catch (error) {
      console.error('Error building circuit:', error);
      throw error;
    }
  }
}
