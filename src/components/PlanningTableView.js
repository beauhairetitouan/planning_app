import React from 'react';
import { format, isToday } from 'date-fns';
import { fr } from 'date-fns/locale';
import PlanningRow from './PlanningRow';
import './PlanningTableView.css';

function PlanningTableView({ weekDays, data, onRemovePerson }) {
    return (
        <div className="table-wrapper">
            <table className="planning-table">
                <thead>
                    <tr>
                        <th className="fixed-column">Prénom</th>
                        {weekDays.map((day, index) => (
                            <th key={index} className={isToday(day) ? 'current-day' : ''}>
                                {format(day, 'EEEE dd/MM', { locale: fr })}
                            </th>
                        ))}
                        <th className="fixed-column">Heures sup.</th>
                        <th className="fixed-column">Heures libérées</th>
                        <th className="fixed-column">Total travaillé</th>
                        <th className="fixed-column">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 && (
                        <tr>
                            <td
                                className="fixed-column"
                                colSpan={weekDays.length + 5}
                                style={{ textAlign: 'center', fontStyle: 'italic', color: '#888' }}
                            >
                                Aucune donnée. Ajoutez un prénom pour commencer.
                            </td>
                        </tr>
                    )}
                    {data.map((person, i) => (
                        <PlanningRow
                            key={i}
                            person={person}
                            weekDays={weekDays}
                            onRemove={() => onRemovePerson(i)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PlanningTableView;
