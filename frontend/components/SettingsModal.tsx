import React from 'react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientId: string, clientSecret: string) => void;
  initialClientId: string;
  initialClientSecret: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, onSave, initialClientId, initialClientSecret 
}) => {
  const [clientId, setClientId] = React.useState(initialClientId);
  const [clientSecret, setClientSecret] = React.useState(initialClientSecret);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">설정</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Spotify Client ID</label>
            <input 
              type="text" 
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Spotify Client Secret</label>
            <input 
              type="password" 
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button 
            onClick={onClose}
            className="flex-1 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
          >
            취소
          </button>
          <button 
            onClick={() => {
              onSave(clientId, clientSecret);
              onClose();
            }}
            className="flex-1 py-2 bg-primary text-black font-bold rounded-lg hover:bg-green-400"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
