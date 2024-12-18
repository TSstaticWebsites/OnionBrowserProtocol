import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2 } from 'lucide-react';
import { TorNode, Circuit } from '../types/tor';
import { nodeService } from '../services/nodeService';
import { encryptionService } from '../services/encryptionService';
import { NodeStats } from './NodeStats';

const ENTRY_PROXY_URL = process.env.REACT_APP_ENTRY_PROXY_URL || 'http://localhost:3002';

export const OnionBrowser: React.FC = () => {
  const [url, setUrl] = useState('');
  const [nodes, setNodes] = useState<TorNode[]>([]);
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    loadNodes();
  }, []);

  const loadNodes = async () => {
    try {
      const availableNodes = await nodeService.getAvailableNodes();
      setNodes(availableNodes);
    } catch (error) {
      setError('Failed to load Tor nodes');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setContent(null);

    try {
      // Select nodes and build circuit
      const selectedCircuit = nodeService.selectNodes(nodes);
      setCircuit(selectedCircuit);

      // Build encrypted packages
      const packages = await encryptionService.buildCircuit(selectedCircuit, url);

      // Send to entry proxy
      const response = await fetch(ENTRY_PROXY_URL + '/relay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packages,
          entryNode: selectedCircuit.entryNode.address
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const html = await response.text();
      setContent(html);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <NodeStats nodes={nodes} />
      <Card>
        <CardHeader>
          <CardTitle>Onion Browser</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter .onion URL"
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !url}>
                {loading ? <Loader2 className="animate-spin" /> : 'Browse'}
              </Button>
            </div>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {circuit && (
            <div className="mt-4 space-y-2">
              <h3 className="text-lg font-semibold">Active Circuit</h3>
              <div className="text-sm">
                Entry: {circuit.entryNode.id}
                → Middle: {circuit.middleNode.id}
                → Exit: {circuit.exitNode.id}
              </div>
            </div>
          )}

          {content && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Response Content</h3>
              <div
                className="bg-secondary p-4 rounded-md"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
