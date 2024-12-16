import { TorNode } from '../types/tor';

const DIRECTORY_AUTHORITY_URL = 'http://localhost:8000'; // Update with actual proxy URL

export async function fetchAvailableNodes(): Promise<TorNode[]> {
  try {
    const response = await fetch(`${DIRECTORY_AUTHORITY_URL}/nodes`);
    if (!response.ok) {
      throw new Error('Failed to fetch nodes');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching nodes:', error);
    throw error;
  }
}

export function selectCircuitNodes(nodes: TorNode[]): { entry: TorNode; middle: TorNode; exit: TorNode } {
  if (nodes.length < 3) {
    throw new Error('Not enough nodes available to create a circuit');
  }

  // Randomly select three different nodes
  const shuffled = [...nodes].sort(() => Math.random() - 0.5);
  const [entry, middle, exit] = shuffled.slice(0, 3);

  return { entry, middle, exit };
}
