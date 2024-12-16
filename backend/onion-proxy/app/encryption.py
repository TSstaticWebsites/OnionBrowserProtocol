from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives import serialization
import base64
from typing import Dict, Optional
import os

class EncryptionService:
    def __init__(self):
        self._private_keys: Dict[str, rsa.RSAPrivateKey] = {}
        self._public_keys: Dict[str, rsa.RSAPublicKey] = {}

    def generate_key_pair(self, node_id: str) -> str:
        """Generate a new RSA key pair for a node and return the public key."""
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048
        )
        public_key = private_key.public_key()

        self._private_keys[node_id] = private_key
        self._public_keys[node_id] = public_key

        # Return public key in PEM format
        pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        return base64.b64encode(pem).decode('utf-8')

    def encrypt_layer(self, node_id: str, data: str) -> str:
        """Encrypt data for a specific node using its public key."""
        if node_id not in self._public_keys:
            raise ValueError(f"No public key found for node {node_id}")

        public_key = self._public_keys[node_id]
        message = data.encode('utf-8')

        encrypted = public_key.encrypt(
            message,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return base64.b64encode(encrypted).decode('utf-8')

    def decrypt_layer(self, node_id: str, encrypted_data: str) -> str:
        """Decrypt data using a node's private key."""
        if node_id not in self._private_keys:
            raise ValueError(f"No private key found for node {node_id}")

        private_key = self._private_keys[node_id]
        encrypted = base64.b64decode(encrypted_data)

        decrypted = private_key.decrypt(
            encrypted,
            padding.OAEP(
                mgf=padding.MGF1(algorithm=hashes.SHA256()),
                algorithm=hashes.SHA256(),
                label=None
            )
        )
        return decrypted.decode('utf-8')

# Create a singleton instance
encryption_service = EncryptionService()
