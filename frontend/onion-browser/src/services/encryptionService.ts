import { Circuit, EncryptedPackage, TorNode, KeyPair, NodeKeys } from '../types/tor';

class EncryptionService {
  private nodeKeys: NodeKeys = {};

  async generateKeyPair(nodeId: string): Promise<string> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: "SHA-256",
      },
      true, // extractable
      ["encrypt", "decrypt"]
    );

    this.nodeKeys[nodeId] = {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey
    };

    // Export public key for sharing
    const exportedPublicKey = await window.crypto.subtle.exportKey(
      "spki",
      keyPair.publicKey
    );

    // Convert to base64
    return btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)));
  }

  async encryptForNode(node: TorNode, data: string): Promise<EncryptedPackage> {
    // For testing with mock keys, use a simplified encryption
    if (node.publicKey.startsWith('mock_key_')) {
      return {
        // Simple base64 encoding for mock data
        data: btoa(JSON.stringify({
          originalData: data,
          encryptedWith: node.publicKey
        })),
        nextHop: node.address
      };
    }

    // Import node's public key
    const binaryKey = Uint8Array.from(atob(node.publicKey), c => c.charCodeAt(0));
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      binaryKey,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"]
    );

    // Encrypt data
    const encodedData = new TextEncoder().encode(data);
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP"
      },
      publicKey,
      encodedData
    );

    return {
      data: btoa(String.fromCharCode(...new Uint8Array(encryptedData))),
      nextHop: node.address
    };
  }

  async buildCircuit(circuit: Circuit, targetUrl: string): Promise<EncryptedPackage[]> {
    // Create payload for exit node
    const exitPayload = {
      url: targetUrl,
      method: 'GET',
      headers: {
        'User-Agent': 'OnionBrowser/1.0'
      }
    };

    // Encrypt in layers: exit -> middle -> entry
    const exitPackage = await this.encryptForNode(
      circuit.exitNode,
      JSON.stringify(exitPayload)
    );

    const middlePackage = await this.encryptForNode(
      circuit.middleNode,
      JSON.stringify({
        nextHop: circuit.exitNode.address,
        data: exitPackage.data
      })
    );

    const entryPackage = await this.encryptForNode(
      circuit.entryNode,
      JSON.stringify({
        nextHop: circuit.middleNode.address,
        data: middlePackage.data
      })
    );

    // Return packages in order: entry -> middle -> exit
    return [entryPackage, middlePackage, exitPackage];
  }
}

export const encryptionService = new EncryptionService();
