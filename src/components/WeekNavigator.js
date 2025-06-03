import React, { useState, useEffect } from 'react';
import { startOfWeek, addDays, subWeeks, addWeeks, format } from 'date-fns';
import { fr } from 'date-fns/locale';

function WeekNavigator({ onWeekChange }) {
    const [weekStart, setWeekStart] = useState(() =>
        startOfWeek(new Date(), { weekStartsOn: 1 })
    );

    const getWeekDays = (startDate) => {
        return Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));
    };

    useEffect(() => {
        const days = getWeekDays(weekStart);
        onWeekChange(days);
    }, [weekStart, onWeekChange]);

    const handlePreviousWeek = () => {
        setWeekStart((prev) => subWeeks(prev, 1));
    };

    const handleNextWeek = () => {
        setWeekStart((prev) => addWeeks(prev, 1));
    };

    return (
        <div className="p-4 max-w-md mx-auto">
            <h2 className="text-xl font-bold mb-4 text-center">
                Semaine du {format(weekStart, 'dd MMMM yyyy', { locale: fr })}
            </h2>

            <div className="flex justify-between mb-4">
                <button onClick={handlePreviousWeek} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                    ⬅️ Précédente
                </button>
                <button onClick={handleNextWeek} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                    Suivante ➡️
                </button>
            </div>
        </div>
    );
}

export default WeekNavigator;
