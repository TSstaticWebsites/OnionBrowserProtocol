import axios from 'axios';
import { TorNode, Circuit } from '../types/tor';

const DIRECTORY_PROXY_URL = process.env.REACT_APP_DIRECTORY_PROXY_URL || 'http://localhost:3001';

export const nodeService = {
  async getAvailableNodes(): Promise<TorNode[]> {
    try {
      const response = await axios.get(`${DIRECTORY_PROXY_URL}/nodes`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch nodes:', error);
      throw error;
    }
  },

  selectNodes(nodes: TorNode[]): Circuit {
    // Filter nodes by role
    const entryNodes = nodes.filter(node => node.role === 'entry');
    const middleNodes = nodes.filter(node => node.role === 'middle');
    const exitNodes = nodes.filter(node => node.role === 'exit');

    // Randomly select one node of each type
    const entryNode = entryNodes[Math.floor(Math.random() * entryNodes.length)];
    const middleNode = middleNodes[Math.floor(Math.random() * middleNodes.length)];
    const exitNode = exitNodes[Math.floor(Math.random() * exitNodes.length)];

    return { entryNode, middleNode, exitNode };
  }
};
