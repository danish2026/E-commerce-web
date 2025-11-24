import { ArrowLeft } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom';

const View = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] p-6">
<div className="max-w-5xl mx-auto">
<button 
          onClick={() => navigate('/invoice')}
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
</div>
<div className="bg-[var(--surface-1)] rounded-lg shadow-sm border border-[var(--glass-border)]">
  <div className="flex justify-between items-center p-6 border-b border-[var(--glass-border)]">
    <div>
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Invoice</h1>
    </div>
  </div>
</div>
    </div>
  )
}

export default View