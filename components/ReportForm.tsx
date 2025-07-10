
import React, { useState } from 'react';
import { IncidentType, Incident } from '../types.ts';
import { SpinnerIcon } from '../constants.tsx';

interface ReportFormProps {
    incidentType: IncidentType;
    addIncident: (data: Omit<Incident, 'id' | 'timestamp' | 'status' | 'aiSummary' | 'aiSteps'>) => Promise<void>;
    onClose: () => void;
    loading: boolean;
}

const ReportForm: React.FC<ReportFormProps> = ({ incidentType, addIncident, onClose, loading }) => {
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [suggestions, setSuggestions] = useState('');
    const [contact, setContact] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!location.trim() || !description.trim()) {
            setError('El lugar y la descripción son campos obligatorios.');
            return;
        }
        setError('');
        await addIncident({
            type: incidentType,
            location,
            description,
            suggestions,
            contact
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            {loading && (
                 <div className="absolute inset-0 bg-brand-dark bg-opacity-80 flex flex-col justify-center items-center z-50">
                    <SpinnerIcon />
                    <p className="text-white text-xl mt-4">Analizando y guardando incidencia...</p>
                </div>
            )}
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg max-h-full overflow-y-auto relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h2 className="text-3xl font-bold text-brand-dark mb-2">Reportar Incidencia</h2>
                <p className={`text-xl font-semibold mb-6 ${incidentType === IncidentType.IT ? 'text-brand-primary' : 'text-brand-accent'}`}>{incidentType}</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Lugar de la incidencia</label>
                        <input type="text" id="location" value={location} onChange={e => setLocation(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary" placeholder="Ej. Aula 302, Patio Central" />
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción del problema</label>
                        <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary" placeholder="Explica detalladamente qué sucede..."></textarea>
                    </div>
                     <div>
                        <label htmlFor="suggestions" className="block text-sm font-medium text-gray-700 mb-1">Sugerencias (Opcional)</label>
                        <textarea id="suggestions" value={suggestions} onChange={e => setSuggestions(e.target.value)} rows={2} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary" placeholder="Aporta ideas para una posible solución"></textarea>
                    </div>
                     <div>
                        <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">Datos de contacto (Opcional)</label>
                        <input type="text" id="contact" value={contact} onChange={e => setContact(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary" placeholder="Tu email para recibir notificaciones" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 mr-4 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-dark transition-colors">Enviar Incidencia</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReportForm;