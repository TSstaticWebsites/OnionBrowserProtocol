export interface TorNode {
  id: string;
  public_key: string;  // Changed from CryptoKey to string to match proxy response
  role: 'entry' | 'middle' | 'exit';  // Added role field
  address: string;
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
