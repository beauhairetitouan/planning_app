import React, { useState, useEffect } from 'react';

const PlanningApp = () => {
    const shifts = {
        '-': { label: '-', hours: 0 },
        'JC-': { label: 'JC-', hours: 7 },
        'V': { label: 'V', hours: 7.75 },
        'N1': { label: 'N1', hours: 7.25 },
        'P': { label: 'P', hours: 7.25 },
        'N2': { label: 'N2', hours: 7.25 },
        'JC': { label: 'JC', hours: 7 }
    };

    // Gestion des semaines (exemple 2 semaines)
    const weeks = [
        {
            label: '02 juin 2025',
            days: [
                'lundi 02/06',
                'mardi 03/06',
                'mercredi 04/06',
                'jeudi 05/06',
                'vendredi 06/06',
                'samedi 07/06',
                'dimanche 08/06'
            ]
        },
        {
            label: '09 juin 2025',
            days: [
                'lundi 09/06',
                'mardi 10/06',
                'mercredi 11/06',
                'jeudi 12/06',
                'vendredi 13/06',
                'samedi 14/06',
                'dimanche 15/06'
            ]
        }
    ];

    const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
    const currentWeek = weeks[currentWeekIndex];
    const days = currentWeek.days;

    const [newName, setNewName] = useState('');
    const [planningData, setPlanningData] = useState(() => {
        const saved = localStorage.getItem('planningData');
        return saved
            ? JSON.parse(saved)
            : {
                'titouan': {
                    [weeks[0].days[0]]: '-',
                    [weeks[0].days[1]]: '-',
                    [weeks[0].days[2]]: '-',
                    [weeks[0].days[3]]: '-',
                    [weeks[0].days[4]]: '-',
                    [weeks[0].days[5]]: '-',
                    [weeks[0].days[6]]: '-',
                    // Init semaine 2 aussi à vide (facultatif)
                    [weeks[1].days[0]]: '-',
                    [weeks[1].days[1]]: '-',
                    [weeks[1].days[2]]: '-',
                    [weeks[1].days[3]]: '-',
                    [weeks[1].days[4]]: '-',
                    [weeks[1].days[5]]: '-',
                    [weeks[1].days[6]]: '-',
                }
            };
    });

    // Heures libérées par personne
    const [heuresLiberees, setHeuresLiberees] = useState(() => {
        const saved = localStorage.getItem('heuresLiberees');
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        localStorage.setItem('planningData', JSON.stringify(planningData));
    }, [planningData]);

    useEffect(() => {
        localStorage.setItem('heuresLiberees', JSON.stringify(heuresLiberees));
    }, [heuresLiberees]);

    const addPerson = () => {
        if (newName.trim() && !planningData[newName.toLowerCase()]) {
            const newPersonData = {};
            weeks.forEach(week => {
                week.days.forEach(day => {
                    newPersonData[day] = '-';
                });
            });
            setPlanningData(prev => ({
                ...prev,
                [newName.toLowerCase()]: newPersonData
            }));
            setNewName('');
        }
    };

    const removePerson = (personName) => {
        setPlanningData(prev => {
            const newData = { ...prev };
            delete newData[personName];
            return newData;
        });
        setHeuresLiberees(prev => {
            const newData = { ...prev };
            delete newData[personName];
            return newData;
        });
    };

    const updateShift = (person, day, shift) => {
        setPlanningData(prev => ({
            ...prev,
            [person]: {
                ...prev[person],
                [day]: shift
            }
        }));
    };

    const changeHeuresLiberees = (person, delta) => {
        setHeuresLiberees(prev => {
            const current = prev[person] || 0;
            let newVal = current + delta;
            if (newVal < 0) newVal = 0;
            return {
                ...prev,
                [person]: newVal
            };
        });
    };

    const calculateHours = (person) => {
        const totalHours = days.reduce((sum, day) => {
            const shift = planningData[person][day];
            return sum + (shifts[shift]?.hours || 0);
        }, 0);

        const lib = heuresLiberees[person] || 0;

        const rawExtra = totalHours - 35 - lib;
        const extraHours = rawExtra > 0 ? rawExtra : 0;

        const adjustedTotal = totalHours - lib > 0 ? totalHours - lib : 0;

        return {
            extraHours,
            adjustedTotal
        };
    };

    const exportCSV = () => {
        const headers = ['Prénom', ...days, 'Heures sup.', 'Heures libérées', 'Total travaillé'];
        const rows = Object.keys(planningData).map(person => {
            // Calcul total sur la semaine courante uniquement
            const totalHours = days.reduce((sum, day) => {
                const shift = planningData[person][day];
                return sum + (shifts[shift]?.hours || 0);
            }, 0);
            const lib = heuresLiberees[person] || 0;
            const extraHours = totalHours - 35 - lib > 0 ? totalHours - 35 - lib : 0;
            const adjustedTotal = totalHours - lib > 0 ? totalHours - lib : 0;

            return [
                person,
                ...days.map(day => planningData[person][day]),
                `${extraHours}h`,
                `${lib}h`,
                `${adjustedTotal}h`
            ];
        });

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `planning-${currentWeek.label.replace(/\s/g, '-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const styles = {
        container: {
            width: '100vw',
            height: '100vh',
            margin: 0,
            padding: 0,
            backgroundColor: '#f1f5f9',
            fontFamily: 'Inter, sans-serif',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        },
        card: {
            width: '100%',
            height: '100%',
            maxWidth: '1600px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        },
        header: {
            padding: '24px',
            borderBottom: '1px solid #e2e8f0',
            textAlign: 'center',
            backgroundColor: 'white'
        },
        title: {
            fontSize: '32px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '4px'
        },
        subtitle: {
            fontSize: '18px',
            fontWeight: '500',
            color: '#64748b'
        },
        navButtons: {
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '16px',
            marginBottom: '24px'
        },
        navButton: {
            padding: '8px 16px',
            backgroundColor: '#e2e8f0',
            color: '#1e293b',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
        },
        addSection: {
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '12px'
        },
        input: {
            padding: '8px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none'
        },
        addButton: {
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
        },
        tableContainer: {
            flex: 1,
            overflow: 'auto',
            padding: '0 16px'
        },
        table: {
            width: '100%',
            tableLayout: 'fixed',
            borderCollapse: 'collapse'
        },
        tableHeader: {
            backgroundColor: '#f3f4f6'
        },
        th: {
            padding: '12px 8px',
            textAlign: 'center',
            fontWeight: '600',
            color: '#1f2937',
            fontSize: '14px',
            borderRight: '1px solid #e5e7eb'
        },
        td: {
            padding: '10px 8px',
            textAlign: 'center',
            borderRight: '1px solid #e5e7eb',
            borderBottom: '1px solid #e5e7eb'
        },
        select: {
            width: '100%',
            padding: '6px 8px',
            fontSize: '13px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
            color: '#1e293b',
            outline: 'none',
            appearance: 'none',
            textAlign: 'center',
            cursor: 'pointer'
        },
        deleteButton: {
            padding: '6px 12px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'background-color 0.2s ease'
        },
        footer: {
            backgroundColor: '#f3f4f6',
            padding: '16px',
            textAlign: 'center',
            borderTop: '1px solid #e5e7eb'
        },
        exportButton: {
            padding: '14px 24px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
        },
        rowEven: {
            backgroundColor: 'white'
        },
        rowOdd: {
            backgroundColor: '#f9fafb'
        },
        heuresLibereesCell: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px'
        },
        heuresLibereesButton: {
            padding: '2px 6px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '14px',
            userSelect: 'none'
        },
        heuresLibereesValue: {
            minWidth: '28px',
            textAlign: 'center',
            fontWeight: '600'
        },
        todayHeader: {
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '4px',
            padding: '4px 8px',
            display: 'inline-block',
            fontWeight: '700'
        }
    };

    // Mettre en avant le jour actuel dans l'en-tête s'il est dans la semaine
    const today = new Date();
    const todayStr = today.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: '2-digit' }); // ex: "mardi 03/06"
    // Attention format à bien matcher les jours dans days
    // Nos jours sont formatés comme "lundi 02/06"
    // Il faut récupérer la date au format "jour dd/mm"
    // Le toLocaleDateString en fr-FR avec weekday long et day/month va générer "mardi 03/06"
    // ça correspond à ce qu'on a dans days

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Planning</h1>
                    <h2 style={styles.subtitle}>Semaine du {currentWeek.label}</h2>
                    <div style={styles.navButtons}>
                        <button
                            style={styles.navButton}
                            disabled={currentWeekIndex === 0}
                            onClick={() => setCurrentWeekIndex(i => Math.max(0, i - 1))}
                        >
                            ← Précédente
                        </button>
                        <button
                            style={styles.navButton}
                            disabled={currentWeekIndex === weeks.length - 1}
                            onClick={() => setCurrentWeekIndex(i => Math.min(weeks.length - 1, i + 1))}
                        >
                            Suivante →
                        </button>
                    </div>
                    <div style={styles.addSection}>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Nouveau prénom"
                            style={styles.input}
                            onKeyPress={(e) => e.key === 'Enter' && addPerson()}
                        />
                        <button onClick={addPerson} style={styles.addButton}>
                            Ajouter
                        </button>
                    </div>
                </div>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead style={styles.tableHeader}>
                            <tr>
                                <th style={styles.th}>Prénom</th>
                                {days.map(day => {
                                    const isToday = day === todayStr;
                                    return (
                                        <th key={day} style={styles.th}>
                                            {isToday ? (
                                                <span style={styles.todayHeader}>{day}</span>
                                            ) : (
                                                day
                                            )}
                                        </th>
                                    );
                                })}
                                <th style={styles.th}>Heures sup.</th>
                                <th style={styles.th}>Heures libérées</th>
                                <th style={styles.th}>Total</th>
                                <th style={styles.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(planningData).map((person, index) => {
                                const { extraHours, adjustedTotal } = calculateHours(person);
                                return (
                                    <tr key={person} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                                        <td style={{ ...styles.td, fontWeight: '600', textTransform: 'capitalize' }}>{person}</td>
                                        {days.map(day => (
                                            <td key={day} style={styles.td}>
                                                <select
                                                    value={planningData[person][day]}
                                                    onChange={(e) => updateShift(person, day, e.target.value)}
                                                    style={styles.select}
                                                >
                                                    {Object.entries(shifts).map(([key, shift]) => (
                                                        <option key={key} value={key}>{shift.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        ))}
                                        <td style={styles.td}>{extraHours > 0 ? `${extraHours}h` : '0h'}</td>
                                        <td style={{ ...styles.td, ...styles.heuresLibereesCell }}>
                                            <button
                                                style={styles.heuresLibereesButton}
                                                onClick={() => changeHeuresLiberees(person, -1)}
                                                title="Réduire de 1h"
                                            >−</button>
                                            <span style={styles.heuresLibereesValue}>{heuresLiberees[person] || 0}h</span>
                                            <button
                                                style={styles.heuresLibereesButton}
                                                onClick={() => changeHeuresLiberees(person, 1)}
                                                title="Augmenter de 1h"
                                            >+</button>
                                        </td>
                                        <td style={{ ...styles.td, fontWeight: 'bold' }}>{adjustedTotal}h</td>
                                        <td style={styles.td}>
                                            <button
                                                onClick={() => removePerson(person)}
                                                style={styles.deleteButton}
                                            >
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div style={styles.footer}>
                    <button onClick={exportCSV} style={styles.exportButton}>Exporter CSV</button>
                </div>
            </div>
        </div>
    );
};

export default PlanningApp;
