import { EncryptedPackage } from '../types/tor';

const ENTRY_PROXY_URL = 'http://localhost:8001'; // Update with actual proxy URL

export async function sendToEntryProxy(pkg: EncryptedPackage): Promise<Response> {
  try {
    const response = await fetch(`${ENTRY_PROXY_URL}/forward`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pkg),
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
