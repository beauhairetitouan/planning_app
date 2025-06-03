import React from 'react';
import WeekNavigator from './WeekNavigator';
import './WeekSelector.css';

function WeekSelector({ onWeekChange }) {
    return (
        <div className="semaine" style={{ marginBottom: '16px' }}>
            <WeekNavigator onWeekChange={onWeekChange} />
        </div>
    );
}

export default WeekSelector;
