import { useState, useEffect } from 'react';

export default function RenameModal({ pet, onConfirm, onCancel }) {
  const [name, setName] = useState('');

  useEffect(() => {
    if (pet) setName(pet.name);
  }, [pet]);

  if (!pet) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000 }}>
      <div className="modal-content bg-small-card" style={{ maxWidth: '520px', padding: '100px 80px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: '300px' }}> {/* Inner constraint box */}
          <h2 className="section-title" style={{ fontSize: '1.4rem', marginBottom: '4px', color: '#8a6200' }}>Rename Pet</h2>
          <p style={{ marginBottom: '16px', color: '#a67c00', fontSize: '1rem', fontWeight: '600', lineHeight: '1.2' }}>Give your {pet.species.replace('_', ' ')} a new identity!</p>
          
          <input
            type="text"
            className="rename-input"
            style={{ fontSize: '1.1rem', padding: '10px', width: '100%' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm(pet.id, name);
              if (e.key === 'Escape') onCancel();
            }}
          />

          <div className="modal-actions" style={{ marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '0.9rem' }} onClick={() => onConfirm(pet.id, name)}>
              Confirm
            </button>
            <button className="btn btn-secondary" style={{ padding: '10px 24px', fontSize: '0.9rem' }} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
