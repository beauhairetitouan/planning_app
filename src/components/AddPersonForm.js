import React, { useState } from 'react';
import './AddPersonForm.css';

function AddPersonForm({ onAdd }) {
    const [inputValue, setInputValue] = useState('');

    const handleAdd = () => {
        if (inputValue.trim() === '') return;
        onAdd(inputValue.trim());
        setInputValue('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <div style={{ marginBottom: '24px' }}>
            <input
                type="text"
                placeholder="Nouveau prénom"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ padding: '8px', fontSize: '1rem', marginRight: '8px' }}
            />
            <button onClick={handleAdd} style={{ padding: '8px 16px', fontSize: '1rem' }}>
                Ajouter
            </button>
        </div>
    );
}

export default AddPersonForm;
