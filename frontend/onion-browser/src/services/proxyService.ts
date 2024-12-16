import axios from 'axios';
import { EncryptedPackage } from '../types/tor';

const ENTRY_PROXY_URL = import.meta.env.VITE_ENTRY_PROXY_URL || 'http://localhost:3002';

interface ProxyResponse {
  content: string;
  status: number;
}

export const proxyService = {
  async sendOnionRequest(packages: EncryptedPackage[], entryNode: string): Promise<string> {
    try {
      const response = await axios.post<ProxyResponse>(`${ENTRY_PROXY_URL}/relay`, {
        packages: packages.map(pkg => ({
          data: pkg.data,
          next_hop: pkg.nextHop
        })),
        entry_node: entryNode
      });

      if (response.data.status === 200) {
        return response.data.content;
      } else {
        throw new Error(`Request failed with status ${response.data.status}`);
      }
    } catch (error) {
      console.error('Failed to send onion request:', error);
      throw error;
    }
  }
};
