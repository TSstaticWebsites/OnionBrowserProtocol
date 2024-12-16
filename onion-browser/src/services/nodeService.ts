import { TorNode } from '../types/tor';

const DIRECTORY_AUTHORITY_URL = 'http://localhost:8000';

export async function fetchAvailableNodes(): Promise<TorNode[]> {
  try {
    console.log('Fetching nodes from Directory Authority...');
    const response = await fetch(`${DIRECTORY_AUTHORITY_URL}/nodes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch nodes: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Received nodes:', data.nodes);
    return data.nodes;
  } catch (error) {
    console.error('Error fetching nodes:', error);
    throw error;
  }
}

export function selectCircuitNodes(nodes: TorNode[]): { entry: TorNode; middle: TorNode; exit: TorNode } {
  console.log('Selecting circuit nodes from available nodes:', nodes);

  if (!nodes || nodes.length < 3) {
    throw new Error('Not enough nodes available to create a circuit');
  }

  const entryNodes = nodes.filter(n => n.role === 'entry');
  const middleNodes = nodes.filter(n => n.role === 'middle');
  const exitNodes = nodes.filter(n => n.role === 'exit');

  console.log(`Available nodes by role: Entry(${entryNodes.length}), Middle(${middleNodes.length}), Exit(${exitNodes.length})`);

  if (!entryNodes.length || !middleNodes.length || !exitNodes.length) {
    throw new Error('Missing required node types for circuit');
  }

  const entry = entryNodes[Math.floor(Math.random() * entryNodes.length)];
  const middle = middleNodes[Math.floor(Math.random() * middleNodes.length)];
  const exit = exitNodes[Math.floor(Math.random() * exitNodes.length)];

  console.log('Selected circuit:', { entry, middle, exit });
  return { entry, middle, exit };
}
