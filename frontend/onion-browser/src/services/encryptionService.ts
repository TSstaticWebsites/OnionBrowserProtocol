import { Circuit, EncryptedPackage, TorNode } from '../types/tor';

export type EncryptionStage = 'exit' | 'middle' | 'entry' | 'complete';

export const encryptionService = {
  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    throw new Error('Waiting for node-forge implementation');
  },

  async buildCircuit(
    circuit: Circuit,
    targetUrl: string,
    onProgress?: (stage: EncryptionStage) => void
  ): Promise<EncryptedPackage[]> {
    const exitPayload = {
      url: targetUrl,
      timestamp: Date.now(),
    };

    onProgress?.('exit');
    const exitPackage = await this.encryptForNode(
      circuit.exitNode,
      JSON.stringify(exitPayload)
    );

    onProgress?.('middle');
    const middlePackage = await this.encryptForNode(
      circuit.middleNode,
      JSON.stringify({
        nextHop: circuit.exitNode.address,
        data: exitPackage.data,
        timestamp: Date.now()
      })
    );

    onProgress?.('entry');
    const entryPackage = await this.encryptForNode(
      circuit.entryNode,
      JSON.stringify({
        nextHop: circuit.middleNode.address,
        data: middlePackage.data,
        timestamp: Date.now()
      })
    );

    onProgress?.('complete');
    return [entryPackage, middlePackage, exitPackage];
  },

  async encryptForNode(node: TorNode, data: string): Promise<EncryptedPackage> {
    const encoded = btoa(data);

    return {
      data: encoded,
      nextHop: node.address
    };
  }
};
