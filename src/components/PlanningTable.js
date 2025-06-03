import React, { useState } from 'react';
import WeekSelector from './WeekSelector';
import AddPersonForm from './AddPersonForm';
import PlanningTableView from './PlanningTableView';
import './PlanningTable.css';



function PlanningTable() {
    const [weekDays, setWeekDays] = useState([]);
    const [data, setData] = useState([]);

    const addPerson = (prenom) => {
        if (prenom.trim() === '') return;
        setData([...data, { prenom }]);
    };

    const removePerson = (index) => {
        setData(data.filter((_, i) => i !== index));
    };

    return (
        <div className="planning-table-container">
            <h1 className="title">Planning</h1>
            <WeekSelector onWeekChange={setWeekDays} />
            <AddPersonForm onAdd={addPerson} />
            {weekDays.length > 0 && (
                <PlanningTableView
                    weekDays={weekDays}
                    data={data}
                    onRemovePerson={removePerson}
                />
            )}
            <button onClick="" className="export-button">
                Exporter en CSV
            </button>
        </div>
    );
}

export default PlanningTable;
