export interface TorNode {
  id: string;
  publicKey: string;
  role: 'entry' | 'middle' | 'exit';
  address: string;
}

export interface Circuit {
  entryNode: TorNode;
  middleNode: TorNode;
  exitNode: TorNode;
}

export interface EncryptedPackage {
  data: string;  // Base64 encoded encrypted data
  nextHop: string;
}

export interface OnionRequest {
  targetUrl: string;
  circuit: Circuit;
  encryptedPackages: EncryptedPackage[];
}

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface NodeKeys {
  [nodeId: string]: KeyPair;
}
