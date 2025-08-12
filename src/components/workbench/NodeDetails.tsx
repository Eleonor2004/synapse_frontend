// src/components/NodeDetails.tsx
"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, Smartphone, MapPin } from 'lucide-react';
import { NetworkNode, NetworkEdge } from '../../hooks/useNetworkData'; // Adjust path as needed

interface NodeDetailsProps {
  node: NetworkNode | null;
  edges: NetworkEdge[];
  position: { x: number; y: number };
  onClose: () => void;
  isVisible: boolean;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node, edges, position, onClose, isVisible }) => {
  if (!node) {
    return null;
  }

  const connectedEdges = edges.filter(edge => 
    (typeof edge.source === 'object' ? edge.source.id : edge.source) === node.id || 
    (typeof edge.target === 'object' ? edge.target.id : edge.target) === node.id
  );
  const totalCalls = connectedEdges.reduce((sum, edge) => sum + edge.callCount, 0);
  const totalSMS = connectedEdges.reduce((sum, edge) => sum + edge.smsCount, 0);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="absolute z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 w-80 pointer-events-auto"
          style={{
            left: Math.min(position.x + 20, window.innerWidth - 340),
            top: Math.max(position.y - 100, 20),
          }}
        >
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/90 to-purple-600/90 text-white rounded-t-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm">{node.phoneNumber}</span>
                <div className="text-xs opacity-90 capitalize">{node.type} Node</div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 p-3 rounded-lg text-center border border-green-200/50 dark:border-green-700/50">
                <div className="text-xl font-bold text-green-700 dark:text-green-400">{totalCalls}</div>
                <div className="text-xs text-green-600 dark:text-green-500 font-medium">Calls</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 p-3 rounded-lg text-center border border-blue-200/50 dark:border-blue-700/50">
                <div className="text-xl font-bold text-blue-700 dark:text-blue-400">{totalSMS}</div>
                <div className="text-xs text-blue-600 dark:text-blue-500 font-medium">SMS</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 p-3 rounded-lg text-center border border-purple-200/50 dark:border-purple-700/50">
                <div className="text-xl font-bold text-purple-700 dark:text-purple-400">{connectedEdges.length}</div>
                <div className="text-xs text-purple-600 dark:text-purple-500 font-medium">Links</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/30 p-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Network Stats</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Degree:</span>
                  <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">{node.degree || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Total:</span>
                  <span className="ml-2 font-semibold text-gray-700 dark:text-gray-300">{node.interactions}</span>
                </div>
              </div>
            </div>
            
            {(node.imei || node.location) && (
              <div className="space-y-2 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                {node.imei && (
                  <div className="flex items-center gap-2 text-sm p-2 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                    <Smartphone className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 font-mono text-xs break-all">{node.imei}</span>
                  </div>
                )}
                {node.location && (
                  <div className="flex items-center gap-2 text-sm p-2 bg-gray-50/80 dark:bg-gray-800/50 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-400 text-xs">{node.location}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};