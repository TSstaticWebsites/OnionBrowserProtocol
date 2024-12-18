import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { TorNode } from '../types/tor';

interface NodeStatsProps {
  nodes: TorNode[];
}

export const NodeStats: React.FC<NodeStatsProps> = ({ nodes }) => {
  const entryNodes = nodes.filter(node => node.role === 'entry');
  const exitNodes = nodes.filter(node => node.role === 'exit');

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Network Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Total Nodes: {nodes.length}</p>
          <p>Entry Nodes: {entryNodes.length}</p>
          <p>Exit Nodes: {exitNodes.length}</p>
        </div>
      </CardContent>
    </Card>
  );
};
