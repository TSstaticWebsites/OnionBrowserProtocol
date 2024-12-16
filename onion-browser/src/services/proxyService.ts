import { EncryptedPackage } from '../types/tor';

const ENTRY_PROXY_URL = 'http://localhost:8001';

export async function sendToEntryProxy(pkg: EncryptedPackage): Promise<Response> {
  try {
    console.log('Preparing packages for entry proxy...');

    // Convert each layer of encrypted data to base64
    const packages = pkg.data.map((layer: ArrayBuffer) => ({
      data: btoa(String.fromCharCode(...new Uint8Array(layer))),
      next_hop: pkg.next_hop
    }));

    console.log('Sending packages to entry proxy:', {
      packagesCount: packages.length,
      entry_node: pkg.next_hop
    });

    const response = await fetch(`${ENTRY_PROXY_URL}/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packages,
        entry_node: pkg.next_hop
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Entry proxy error:', errorText);
      throw new Error(`Failed to forward package through entry proxy: ${response.status} ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error('Error sending package to entry proxy:', error);
    throw error;
  }
}
