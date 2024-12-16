import { EncryptedPackage } from '../types/tor';

const ENTRY_PROXY_URL = 'http://localhost:8001';

export async function sendToEntryProxy(pkg: EncryptedPackage): Promise<Response> {
  try {
    const response = await fetch(`${ENTRY_PROXY_URL}/relay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        packages: [pkg],
        entry_node: pkg.nextNode
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to forward package through entry proxy');
    }

    return response;
  } catch (error) {
    console.error('Error sending package to entry proxy:', error);
    throw error;
  }
}
