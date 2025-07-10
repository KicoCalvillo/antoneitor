
import React, { useMemo } from 'react';
import { Incident, IncidentStatus, IncidentType } from '../types.ts';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { STATUS_COLORS } from '../constants.tsx';

interface StatsDashboardProps {
    incidents: Incident[];
}

const StatCard = ({ title, value, colorClass }: { title: string; value: string; colorClass: string }) => (
    <div className={`p-4 rounded-xl shadow-lg text-center ${colorClass}`}>
        <h4 className="text-md font-semibold text-white/90">{title}</h4>
        <p className="text-3xl font-bold text-white">{value}</p>
    </div>
);

const StatsDashboard: React.FC<StatsDashboardProps> = ({ incidents }) => {
    const statusData = useMemo(() => {
        const counts = incidents.reduce((acc, incident) => {
            acc[incident.status] = (acc[incident.status] || 0) + 1;
            return acc;
        }, {} as Record<IncidentStatus, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [incidents]);

    const typeData = useMemo(() => {
        const counts = incidents.reduce((acc, incident) => {
            acc[incident.type] = (acc[incident.type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [incidents]);

    const itCount = useMemo(() => typeData.find(d => d.name === IncidentType.IT)?.value || 0, [typeData]);
    const buildingCount = useMemo(() => typeData.find(d => d.name === IncidentType.Building)?.value || 0, [typeData]);

    const resolutionTimeData = useMemo(() => {
        const resolvedIncidents = incidents.filter(
            inc => inc.status === IncidentStatus.Resolved && inc.resolvedTimestamp
        );

        const timeDiffs: { [key in IncidentType]?: number[] } = {};

        resolvedIncidents.forEach(inc => {
            const createTime = new Date(inc.id).getTime();
            const resolveTime = new Date(inc.resolvedTimestamp!).getTime();
            const diff = resolveTime - createTime;

            if (!timeDiffs[inc.type]) {
                timeDiffs[inc.type] = [];
            }
            timeDiffs[inc.type]!.push(diff);
        });

        const formatDuration = (ms: number) => {
            if (!ms || ms <= 0 || isNaN(ms)) return "N/A";
            const minutes = ms / (1000 * 60);
            if (minutes < 60) return `${Math.round(minutes)} min`;
            const hours = minutes / 60;
            if (hours < 24) return `${hours.toFixed(1)} h`;
            const days = hours / 24;
            return `${days.toFixed(1)} días`;
        };
        
        const calculateAverage = (times: number[] | undefined) => {
            if (!times || times.length === 0) return 0;
            const sum = times.reduce((a, b) => a + b, 0);
            return sum / times.length;
        };

        return {
            [IncidentType.IT]: formatDuration(calculateAverage(timeDiffs[IncidentType.IT])),
            [IncidentType.Building]: formatDuration(calculateAverage(timeDiffs[IncidentType.Building])),
        };
    }, [incidents]);


    return (
        <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-3xl font-bold text-brand-dark mb-8">Estadísticas de Incidencias</h2>
            {incidents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <p className="text-xl text-gray-500">No hay datos de incidencias para mostrar estadísticas.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                        <StatCard title="Total IT" value={itCount.toString()} colorClass="bg-brand-primary" />
                        <StatCard title="Total Edificios" value={buildingCount.toString()} colorClass="bg-brand-accent" />
                        <StatCard title="Resolución Media (IT)" value={resolutionTimeData[IncidentType.IT]} colorClass="bg-brand-dark" />
                        <StatCard title="Resolución Media (Edif.)" value={resolutionTimeData[IncidentType.Building]} colorClass="bg-brand-dark" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-xl font-semibold text-brand-dark mb-4 text-center">Distribución por Estado</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        {statusData.map((entry, index) => {
                                            const colorInfo = STATUS_COLORS[entry.name as IncidentStatus];
                                            // Fallback to a default color if status is not in our map
                                            const fillColor = colorInfo ? colorInfo.hex : '#CCCCCC';
                                            return <Cell key={`cell-${index}`} fill={fillColor} />;
                                        })}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg">
                            <h3 className="text-xl font-semibold text-brand-dark mb-4 text-center">Incidencias por Tipo</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={typeData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false}/>
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" name="Nº Incidencias">
                                        {typeData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.name === 'Informática' ? '#005A9C' : '#E87722'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default StatsDashboard;