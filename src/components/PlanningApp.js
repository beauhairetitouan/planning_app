import React, { useState } from 'react';

const PlanningApp = () => {
    const shifts = {
        'R': { label: 'R', hours: 0, color: 'white' },
        'JC-': { label: 'JC-', hours: 7, color: 'yellow' },
        'V': { label: 'V', hours: 7.75, color: 'red' },
        'N1': { label: 'N1', hours: 7.25, color: 'orange' },
        'P': { label: 'P', hours: 7.25, color: 'green' },
        'N2': { label: 'N2', hours: 7.25, color: 'blue' },
        'JC': { label: 'JC', hours: 7, color: 'purple' },
        'LAC': { label: 'LAC', hours: 7, color: 'pink' },
    };

    // Fonction pour convertir les heures décimales en format h:mm
    const formatHours = (decimalHours) => {
        if (decimalHours === 0) return '0h00';
        const hours = Math.floor(decimalHours);
        const minutes = Math.round((decimalHours - hours) * 60);
        return `${hours}h${minutes.toString().padStart(2, '0')}`;
    };

    // Génère toutes les semaines de l'année en cours (lundi au dimanche)
    const generateWeeks = (year) => {
        const weeks = [];
        const date = new Date(year, 0, 1);

        // Ajuster au premier lundi de l'année
        while (date.getDay() !== 1) { // 1 = lundi
            date.setDate(date.getDate() + 1);
        }

        // Formater un jour "lundi 02/06"
        const formatDay = (d) => {
            const daysFR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
            const dayName = daysFR[d.getDay()];
            const dayNum = String(d.getDate()).padStart(2, '0');
            const monthNum = String(d.getMonth() + 1).padStart(2, '0');
            return `${dayName} ${dayNum}/${monthNum}`;
        };

        while (date.getFullYear() === year) {
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const currentDay = new Date(date);
                currentDay.setDate(date.getDate() + i);
                if (currentDay.getFullYear() === year) {
                    weekDays.push(formatDay(currentDay));
                }
            }
            if (weekDays.length === 7) {
                // Label semaine = date du lundi format "02 juin 2025"
                const labelDate = date;
                const options = { day: '2-digit', month: 'long', year: 'numeric' };
                const label = labelDate.toLocaleDateString('fr-FR', options);

                weeks.push({ label, days: weekDays });
            }
            date.setDate(date.getDate() + 7);
        }
        return weeks;
    };

    const currentYear = new Date().getFullYear();
    const weeks = generateWeeks(currentYear);

    // Formattage date aujourd'hui pour comparer avec les jours des semaines
    const today = new Date();
    const todayFormatted = (() => {
        const daysFR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
        const dayName = daysFR[today.getDay()];
        const dayNum = String(today.getDate()).padStart(2, '0');
        const monthNum = String(today.getMonth() + 1).padStart(2, '0');
        return `${dayName} ${dayNum}/${monthNum}`;
    })();

    // Trouver l'index de la semaine qui contient la date d'aujourd'hui
    const currentWeekDefaultIndex = weeks.findIndex(week => week.days.includes(todayFormatted));

    const [currentWeekIndex, setCurrentWeekIndex] = useState(() =>
        currentWeekDefaultIndex !== -1 ? currentWeekDefaultIndex : 0
    );
    const currentWeek = weeks[currentWeekIndex];
    const days = currentWeek.days;

    const [newName, setNewName] = useState('');
    const [planningData, setPlanningData] = useState(() => {
        // Init planning vide pour tous les utilisateurs et toutes les semaines
        return {};
    });

    const [heuresLiberees, setHeuresLiberees] = useState(() => {
        return {};
    });

    // État pour la popup de suppression
    const [deletePopup, setDeletePopup] = useState({ show: false, person: null });

    const addPerson = () => {
        if (newName.trim() && !planningData[newName.toLowerCase()]) {
            // Initialise planning vide sur toutes les semaines pour cette personne
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
        setDeletePopup({ show: false, person: null });
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
        // Calcul uniquement sur la semaine affichée (days)
        const totalHours = days.reduce((sum, day) => {
            const shift = planningData[person]?.[day] || '-';
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
            const totalHours = days.reduce((sum, day) => {
                const shift = planningData[person]?.[day] || '-';
                return sum + (shifts[shift]?.hours || 0);
            }, 0);
            const lib = heuresLiberees[person] || 0;
            const extraHours = totalHours - 35 - lib > 0 ? totalHours - 35 - lib : 0;
            const adjustedTotal = totalHours - lib > 0 ? totalHours - lib : 0;

            return [
                person,
                ...days.map(day => planningData[person]?.[day] || '-'),
                formatHours(extraHours),
                formatHours(lib),
                formatHours(adjustedTotal)
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

    const exportPNG = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Taille du canvas (sans la colonne supprimer)
        const cellWidth = 120;
        const cellHeight = 40;
        const cols = days.length + 4; // jours + prénom + 3 colonnes heures
        const rows = Object.keys(planningData).length + 1; // données + header

        canvas.width = cols * cellWidth;
        canvas.height = rows * cellHeight;

        // Fond blanc
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Style de texte
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Header
        const headers = ['Prénom', ...days, 'Heures sup.', 'Heures libérées', 'Total travaillé'];
        headers.forEach((header, colIndex) => {
            // Fond header
            ctx.fillStyle = header === todayFormatted ? '#fde68a' : '#f3f4f6';
            ctx.fillRect(colIndex * cellWidth, 0, cellWidth, cellHeight);

            // Bordure
            ctx.strokeStyle = '#e5e7eb';
            ctx.strokeRect(colIndex * cellWidth, 0, cellWidth, cellHeight);

            // Texte header
            ctx.fillStyle = 'black';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillText(header, colIndex * cellWidth + cellWidth / 2, cellHeight / 2);
        });

        // Données
        Object.keys(planningData).forEach((person, rowIndex) => {
            const y = (rowIndex + 1) * cellHeight;
            const { extraHours, adjustedTotal } = calculateHours(person);

            // Prénom
            ctx.fillStyle = '#f9fafb';
            ctx.fillRect(0, y, cellWidth, cellHeight);
            ctx.strokeStyle = '#e5e7eb';
            ctx.strokeRect(0, y, cellWidth, cellHeight);
            ctx.fillStyle = 'black';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText(person, cellWidth / 2, y + cellHeight / 2);

            // Jours avec couleurs de shifts
            days.forEach((day, dayIndex) => {
                const colIndex = dayIndex + 1;
                const x = colIndex * cellWidth;
                const shiftKey = planningData[person][day] || '-';
                const shift = shifts[shiftKey];

                // Fond couleur du shift
                ctx.fillStyle = shift?.color || 'white';
                ctx.fillRect(x, y, cellWidth, cellHeight);

                // Bordure
                ctx.strokeStyle = '#e5e7eb';
                ctx.strokeRect(x, y, cellWidth, cellHeight);

                // Texte shift
                ctx.fillStyle = 'black';
                ctx.font = 'bold 14px Inter, sans-serif';
                ctx.fillText(shift?.label || '-', x + cellWidth / 2, y + cellHeight / 2);
            });

            // Colonnes heures
            const hoursCols = [
                formatHours(extraHours),
                formatHours(heuresLiberees[person] || 0),
                formatHours(adjustedTotal)
            ];

            hoursCols.forEach((value, colIndex) => {
                const x = (days.length + 1 + colIndex) * cellWidth;

                // Fond
                ctx.fillStyle = '#e0f2fe';
                ctx.fillRect(x, y, cellWidth, cellHeight);

                // Bordure
                ctx.strokeStyle = '#e5e7eb';
                ctx.strokeRect(x, y, cellWidth, cellHeight);

                // Texte
                ctx.fillStyle = 'black';
                ctx.font = 'bold 14px Inter, sans-serif';
                ctx.fillText(value, x + cellWidth / 2, y + cellHeight / 2);
            });
        });

        // Télécharger
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `planning-${currentWeek.label.replace(/\s/g, '-')}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
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
            marginBottom: '24px',
            flexWrap: 'wrap'
        },
        navButton: {
            padding: '8px 16px',
            backgroundColor: '#e2e8f0',
            color: '#1e293b',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            userSelect: 'none'
        },
        addSection: {
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '12px',
            flexWrap: 'wrap'
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
            border: '1px solid #e5e7eb',
            padding: '8px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            fontWeight: '600',
            fontSize: '12px',
            backgroundColor: '#f3f4f6',
            userSelect: 'none',
            cursor: 'default'
        },
        td: {
            border: '1px solid #e5e7eb',
            padding: '8px',
            textAlign: 'center',
            fontSize: '14px',
            userSelect: 'none'
        },
        select: {
            width: '100%',
            padding: '4px',
            borderRadius: '4px',
            border: 'none',
            fontSize: '14px',
            color: '#1e293b',
            fontWeight: '600',
            appearance: 'none',
            backgroundColor: 'transparent',
            outline: 'none'
        },
        nameCell: {
            fontWeight: '600',
            textTransform: 'capitalize',
            backgroundColor: '#f9fafb',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        nameCellHover: {
            backgroundColor: '#fee2e2'
        },
        hoursCell: {
            fontWeight: '700',
            backgroundColor: '#e0f2fe'
        },
        todayHeader: {
            backgroundColor: '#fde68a',
            fontWeight: '700'
        },
        heuresLibereesControls: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
        },
        heuresLibereesButton: {
            padding: '2px 8px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '700',
            userSelect: 'none'
        },
        // Styles pour la popup
        popupOverlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        },
        popup: {
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '12px',
            boxShadow: '0 12px 24px rgba(0, 0, 0, 0.2)',
            minWidth: '300px',
            textAlign: 'center'
        },
        popupTitle: {
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1e293b'
        },
        popupText: {
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '20px'
        },
        popupButtons: {
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
        },
        popupButtonCancel: {
            padding: '8px 16px',
            backgroundColor: '#e2e8f0',
            color: '#1e293b',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
        },
        popupButtonDelete: {
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <header style={styles.header}>
                    <h1 style={styles.title}>Planning Semaine</h1>
                    <p style={styles.subtitle}>{currentWeek.label}</p>
                    <div style={styles.navButtons}>
                        <button
                            style={styles.navButton}
                            onClick={() => setCurrentWeekIndex(i => (i > 0 ? i - 1 : i))}
                        >
                            {'<'} Semaine précédente
                        </button>
                        <button
                            style={styles.navButton}
                            onClick={() => setCurrentWeekIndex(i => (i < weeks.length - 1 ? i + 1 : i))}
                        >
                            Semaine suivante {'>'}
                        </button>
                        <button
                            style={styles.navButton}
                            onClick={() => setCurrentWeekIndex(currentWeekDefaultIndex !== -1 ? currentWeekDefaultIndex : 0)}
                        >
                            Semaine courante
                        </button>
                    </div>
                    <div style={styles.addSection}>
                        <input
                            type="text"
                            placeholder="Ajouter prénom"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            style={styles.input}
                            onKeyDown={e => e.key === 'Enter' && addPerson()}
                        />
                        <button onClick={addPerson} style={styles.addButton}>
                            Ajouter
                        </button>
                        <button onClick={exportCSV} style={styles.addButton}>
                            Exporter CSV
                        </button>
                        <button onClick={exportPNG} style={styles.addButton}>
                            Exporter PNG
                        </button>
                    </div>
                </header>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead style={styles.tableHeader}>
                            <tr>
                                <th style={{ ...styles.th, minWidth: '120px' }}>Prénom</th>
                                {days.map(day => (
                                    <th
                                        key={day}
                                        style={{
                                            ...styles.th,
                                            ...(day === todayFormatted ? styles.todayHeader : {})
                                        }}
                                    >
                                        {day}
                                    </th>
                                ))}
                                <th style={styles.th}>Heures sup.</th>
                                <th style={styles.th}>Heures libérées</th>
                                <th style={styles.th}>Total travaillé</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(planningData).map(person => {
                                const { extraHours, adjustedTotal } = calculateHours(person);
                                return (
                                    <tr key={person}>
                                        <td
                                            style={styles.nameCell}
                                            onClick={() => setDeletePopup({ show: true, person })}
                                            onMouseEnter={(e) => {
                                                e.target.style.backgroundColor = '#fee2e2';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.backgroundColor = '#f9fafb';
                                            }}
                                        >
                                            {person}
                                        </td>
                                        {days.map(day => {
                                            const shiftKey = planningData[person][day] || '-';
                                            return (
                                                <td
                                                    key={day}
                                                    style={{
                                                        ...styles.td,
                                                        backgroundColor: shifts[shiftKey]?.color || 'white'
                                                    }}
                                                >
                                                    <select
                                                        value={shiftKey}
                                                        onChange={e => updateShift(person, day, e.target.value)}
                                                        style={styles.select}
                                                    >
                                                        {Object.keys(shifts).map(shiftKey => (
                                                            <option key={shiftKey} value={shiftKey}>
                                                                {shifts[shiftKey].label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                            );
                                        })}
                                        <td style={styles.hoursCell}>{formatHours(extraHours)}</td>
                                        <td style={styles.hoursCell}>
                                            <button
                                                style={{ marginRight: '4px' }}
                                                onClick={() => changeHeuresLiberees(person, -1)}
                                            >
                                                -
                                            </button>
                                            {formatHours(heuresLiberees[person] || 0)}
                                            <button
                                                style={{ marginLeft: '4px' }}
                                                onClick={() => changeHeuresLiberees(person, 1)}
                                            >
                                                +
                                            </button>
                                        </td>
                                        <td style={styles.hoursCell}>{formatHours(adjustedTotal)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Popup de confirmation de suppression */}
            {deletePopup.show && (
                <div style={styles.popupOverlay}>
                    <div style={styles.popup}>
                        <h3 style={styles.popupTitle}>Confirmer la suppression</h3>
                        <p style={styles.popupText}>
                            Voulez-vous vraiment supprimer <strong>{deletePopup.person}</strong> du planning ?
                        </p>
                        <div style={styles.popupButtons}>
                            <button
                                style={styles.popupButtonCancel}
                                onClick={() => setDeletePopup({ show: false, person: null })}
                            >
                                Annuler
                            </button>
                            <button
                                style={styles.popupButtonDelete}
                                onClick={() => removePerson(deletePopup.person)}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlanningApp;