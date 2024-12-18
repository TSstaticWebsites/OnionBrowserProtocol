import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { ArrowRight, Shield, Globe, Server } from 'lucide-react';
import { Circuit, EncryptedPackage } from '../types/tor';

interface CircuitProgressProps {
  circuit: Circuit | null;
  encryptionStage: 'idle' | 'exit' | 'middle' | 'entry' | 'complete';
  packages: EncryptedPackage[];
}

export const CircuitProgress: React.FC<CircuitProgressProps> = ({
  circuit,
  encryptionStage,
  packages
}) => {
  const getProgressPercentage = () => {
    switch (encryptionStage) {
      case 'idle': return 0;
      case 'exit': return 25;
      case 'middle': return 50;
      case 'entry': return 75;
      case 'complete': return 100;
      default: return 0;
    }
  };

  const getNodeStyle = (role: 'entry' | 'middle' | 'exit') => {
    const isActive = (
      (role === 'exit' && encryptionStage === 'exit') ||
      (role === 'middle' && encryptionStage === 'middle') ||
      (role === 'entry' && encryptionStage === 'entry')
    );

    return {
      opacity: isActive ? 1 : 0.7,
      transform: isActive ? 'scale(1.05)' : 'scale(1)',
      transition: 'all 0.2s ease-in-out'
    };
  };

  if (!circuit) return null;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="text-sm font-medium">Circuit Building Progress</div>
          <Progress value={getProgressPercentage()} className="w-full" />

          <div className="flex items-center justify-between gap-4 mt-4">
            {/* Entry Node */}
            <div
              className="flex flex-col items-center gap-2"
              style={getNodeStyle('entry')}
            >
              <Shield className="w-8 h-8 text-blue-500" />
              <div className="text-xs font-medium">Entry Node</div>
              <div className="text-xs text-muted-foreground truncate w-24 text-center">
                {circuit.entryNode?.address || 'Unknown'}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground" />

            {/* Middle Node */}
            <div
              className="flex flex-col items-center gap-2"
              style={getNodeStyle('middle')}
            >
              <Server className="w-8 h-8 text-purple-500" />
              <div className="text-xs font-medium">Middle Node</div>
              <div className="text-xs text-muted-foreground truncate w-24 text-center">
                {circuit.middleNode?.address || 'Unknown'}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground" />

            {/* Exit Node */}
            <div
              className="flex flex-col items-center gap-2"
              style={getNodeStyle('exit')}
            >
              <Globe className="w-8 h-8 text-green-500" />
              <div className="text-xs font-medium">Exit Node</div>
              <div className="text-xs text-muted-foreground truncate w-24 text-center">
                {circuit.exitNode?.address || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Encryption Status */}
          <div className="text-xs text-muted-foreground mt-2">
            {encryptionStage === 'idle' && 'Ready to build circuit...'}
            {encryptionStage === 'exit' && 'Encrypting for exit node...'}
            {encryptionStage === 'middle' && 'Encrypting for middle node...'}
            {encryptionStage === 'entry' && 'Encrypting for entry node...'}
            {encryptionStage === 'complete' && 'Circuit built successfully!'}
          </div>

          {/* Package Progress */}
          {packages.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Packages created: {packages.length}/3
              </div>
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-xs flex-1 text-center ${
                      i < packages.length
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    Package {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
