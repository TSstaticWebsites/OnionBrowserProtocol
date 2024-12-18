import axios from 'axios';
import { TorNode, Circuit } from '../types/tor';
import { encryptionService } from './encryptionService';

const DIRECTORY_PROXY_URL = import.meta.env.VITE_DIRECTORY_PROXY_URL || 'http://localhost:3001';

export const nodeService = {
  async getAvailableNodes(): Promise<TorNode[]> {
    try {
      const response = await axios.get(`${DIRECTORY_PROXY_URL}/nodes`);

      // Generate key pairs for each node client-side
      const nodes = await Promise.all(response.data.map(async (node: any) => {
        const { publicKey } = await encryptionService.generateKeyPair();
        return {
          ...node,
          publicKey,
          role: node.flags.includes('Exit') ? 'exit' :
                node.flags.includes('Guard') ? 'entry' :
                'middle'
        };
      }));

      return nodes;
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
      throw error;
    }
  },

  selectNodes(nodes: TorNode[]): Circuit {
    const entryNodes = nodes.filter(node => node.role === 'entry');
    const middleNodes = nodes.filter(node => node.role === 'middle');
    const exitNodes = nodes.filter(node => node.role === 'exit');

    const entryNode = entryNodes[Math.floor(Math.random() * entryNodes.length)];
    const middleNode = middleNodes[Math.floor(Math.random() * middleNodes.length)];
    const exitNode = exitNodes[Math.floor(Math.random() * exitNodes.length)];

    return { entryNode, middleNode, exitNode };
  }
};
