'use client';

import { useState } from 'react';
import { NavBar } from '@/components/layout/NavBar';
import { ControlSideBar } from '@/components/workbench/ControlSideBar';
import { GraphCanvas } from '@/components/workbench/GraphCanvas';
import { DetailsSideBar } from '@/components/workbench/DetailsSideBar';
import { type SelectedItem } from '@/types'; // We will create this type

export default function WorkbenchPage() {
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);

  // Mock function to simulate selecting a node
  const handleSelectNode = () => {
    setSelectedItem({
      id: 'node-123',
      type: 'node',
      data: { name: 'John Doe', phone: '555-1234', status: 'Active' },
    });
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <NavBar variant="workbench" />
      <div className="flex flex-1 overflow-hidden">
        <ControlSideBar />
        <main className="flex-1 relative">
          <GraphCanvas onSelectNode={handleSelectNode} />
        </main>
        <DetailsSideBar selectedItem={selectedItem} onClose={() => setSelectedItem(null)} />
      </div>
    </div>
  );
}