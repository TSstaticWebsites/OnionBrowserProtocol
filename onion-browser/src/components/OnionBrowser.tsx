import React, { useState, useEffect } from 'react';
import { Circuit, TorNode } from '../types/tor';
import { fetchAvailableNodes, selectCircuitNodes } from '../services/nodeService';
import { EncryptionService } from '../services/encryptionService';
import { sendToEntryProxy } from '../services/proxyService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';

export function OnionBrowser() {
  const [url, setUrl] = useState('');
  const [circuit, setCircuit] = useState<Circuit | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setupCircuit();
  }, []);

  async function setupCircuit() {
    try {
      const nodes = await fetchAvailableNodes();
      const selectedNodes = selectCircuitNodes(nodes);
      setCircuit(selectedNodes);
    } catch (error) {
      setError('Failed to setup Tor circuit');
      console.error(error);
    }
  }

  async function handleBrowse() {
    if (!circuit) {
      setError('No circuit available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare the payload (URL request)
      const payload = new TextEncoder().encode(url);

      // Build encrypted package through the circuit
      const encryptedPackage = await EncryptionService.buildCircuit(circuit, payload);

      // Send through entry proxy
      const response = await sendToEntryProxy(encryptedPackage);
      const html = await response.text();

      setContent(html);
    } catch (error) {
      setError('Failed to fetch content');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Onion Browser</h1>

        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter .onion URL"
            className="flex-1"
          />
          <Button
            onClick={handleBrowse}
            disabled={loading || !circuit}
          >
            {loading ? 'Loading...' : 'Browse'}
          </Button>
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        {content && (
          <div className="mt-4 p-4 border rounded">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </Card>
    </div>
  );
}
