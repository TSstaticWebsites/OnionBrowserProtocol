export interface TorNode {
  id: string;
  publicKey: CryptoKey;
  address: string;
  port: number;
}

export interface Circuit {
  entry: TorNode;
  middle: TorNode;
  exit: TorNode;
}

export interface EncryptedPackage {
  data: ArrayBuffer;
  nextNode: string;
}
