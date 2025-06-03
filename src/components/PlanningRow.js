import React from 'react';
import { isToday } from 'date-fns';
import './PlanningRow.css';

function PlanningRow({ person, weekDays, onRemove }) {
    return (
        <tr>
            <td className="fixed-column">{person.prenom}</td>
            {weekDays.map((day, index) => (
                <td key={index} className={isToday(day) ? 'current-day-cell' : ''}>
                    -
                </td>
            ))}
            <td className="fixed-column">0h</td>
            <td className="fixed-column">0h</td>
            <td className="fixed-column">0h</td>
            <td className="fixed-column">
                <button
                    onClick={onRemove}
                    style={{
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                    }}
                    title="Supprimer"
                >
                    Supprimer
                </button>
            </td>
        </tr>
    );
}

export default PlanningRow;
