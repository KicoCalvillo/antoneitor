
import { useState, useEffect, useCallback } from 'react';
import { Incident, IncidentStatus, IncidentType, AppConfig } from '../types.ts';
import { generateIncidentAnalysis } from '../services/geminiService.ts';
import { DEFAULT_CONFIG } from '../constants.tsx';

const INCIDENTS_STORAGE_KEY = 'incidents_data';
const CONFIG_STORAGE_KEY = 'app_config';

export const useIncidents = () => {
    const [incidents, setIncidents] = useState<Incident[]>(() => {
        try {
            const storedIncidents = localStorage.getItem(INCIDENTS_STORAGE_KEY);
            return storedIncidents ? JSON.parse(storedIncidents) : [];
        } catch (error) {
            console.error("Error reading incidents from localStorage", error);
            return [];
        }
    });
    
    const [config, setConfig] = useState<AppConfig>(() => {
        try {
            const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
            return storedConfig ? JSON.parse(storedConfig) : DEFAULT_CONFIG;
        } catch (error) {
            console.error("Error reading config from localStorage", error);
            return DEFAULT_CONFIG;
        }
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            localStorage.setItem(INCIDENTS_STORAGE_KEY, JSON.stringify(incidents));
        } catch (error) {
            console.error("Error saving incidents to localStorage", error);
        }
    }, [incidents]);

    useEffect(() => {
        try {
            localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
            console.error("Error saving config to localStorage", error);
        }
    }, [config]);

    const addIncident = useCallback(async (newIncidentData: Omit<Incident, 'id' | 'timestamp' | 'status' | 'aiSummary' | 'aiSteps'>) => {
        setLoading(true);
        setError(null);
        try {
            const analysis = await generateIncidentAnalysis(newIncidentData.description, newIncidentData.suggestions || '');

            const newIncident: Incident = {
                ...newIncidentData,
                id: new Date().toISOString(),
                timestamp: new Date().toLocaleString('es-ES'),
                status: IncidentStatus.Reported,
                aiSummary: analysis?.summary,
                aiSteps: analysis?.steps
            };
            setIncidents(prev => [newIncident, ...prev]);
             // Simulate sending email
            console.log(`Simulating email notification for ${newIncident.type} to ${newIncident.type === IncidentType.IT ? config.itEmail : config.buildingEmail}`);

        } catch (e) {
            setError('Failed to create incident.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [config.itEmail, config.buildingEmail]);

    const updateIncidentStatus = useCallback((incidentId: string, status: IncidentStatus) => {
        setIncidents(prev =>
            prev.map(inc => {
                if (inc.id === incidentId) {
                    const updatedInc: Incident = { ...inc, status };
                    if (status === IncidentStatus.Resolved && !inc.resolvedTimestamp) {
                        updatedInc.resolvedTimestamp = new Date().toISOString();
                    }
                    return updatedInc;
                }
                return inc;
            })
        );
        // Here you could also trigger a notification
        console.log(`Incident ${incidentId} status changed to ${status}. Simulating user notification.`);
    }, []);
    
    const updateConfig = useCallback((newConfig: AppConfig) => {
        setConfig(newConfig);
    }, []);

    return { incidents, addIncident, updateIncidentStatus, loading, error, config, updateConfig };
};