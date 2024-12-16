import { useState, useEffect } from 'react';
import { Circuit } from '../types/tor';
import { fetchAvailableNodes, selectCircuitNodes } from '../services/nodeService';
import { EncryptionService } from '../services/encryptionService';
import { sendToEntryProxy } from '../services/proxyService';

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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Onion Browser
        </h1>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <input
            type="text"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            placeholder="Enter .onion URL"
            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          <button
            onClick={handleBrowse}
            disabled={loading || !circuit}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: loading || !circuit ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !circuit ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Loading...' : 'Browse'}
          </button>
        </div>

        {error && (
          <div style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</div>
        )}

        {content && (
          <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
      </div>
    </div>
  );
}
