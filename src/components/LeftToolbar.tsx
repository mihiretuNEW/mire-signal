import React from 'react';
import { Type, Minus, ShieldAlert, TrendingUp, Trash2 } from 'lucide-react';

interface LeftToolbarProps {
  activeTool: string | null;
  setActiveTool: (tool: string | null) => void;
  clearDrawings: () => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({ activeTool, setActiveTool, clearDrawings }) => {
  const tools = [
    { id: 'trend', icon: <TrendingUp size={18} />, label: 'Trend Line' },
    { id: 'horizontal', icon: <Minus size={18} />, label: 'Horizontal Line' },
    { id: 'risk-reward', icon: <ShieldAlert size={18} />, label: 'Risk/Reward Box' },
  ];

  return (
    <div className="flex flex-col items-center bg-[#1c2030] border-r border-[#2a2e39] w-12 md:w-14 py-4 gap-4 h-full">
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
          title={tool.label}
          className={`p-2 rounded-md transition-all ${
            activeTool === tool.id 
              ? 'bg-[#2962ff] text-white' 
              : 'text-[#848e9c] hover:bg-[#2a2e39] hover:text-white'
          }`}
        >
          {tool.icon}
        </button>
      ))}
      <hr className="w-2/3 border-[#2a2e39]" />
      <button
        onClick={clearDrawings}
        title="Clear All Drawings"
        className="p-2 rounded-md text-[#ef5350] hover:bg-[#2a2e39] transition-all"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};
