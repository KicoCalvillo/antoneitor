
import React, { useState, useCallback } from 'react';
import { Incident, IncidentStatus, IncidentType, View, AppConfig } from './types.ts';
import { useIncidents } from './hooks/useIncidents.ts';
import { 
    ADMIN_PASSWORD, STATUS_COLORS, IconComputer, IconBuilding, IconList, IconChart, IconAdmin, IconBack, IconSparkles, IconSettings, IconLogout
} from './constants.tsx';
import ReportForm from './components/ReportForm.tsx';
import StatsDashboard from './components/StatsDashboard.tsx';

const AdminLoginModal: React.FC<{
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
    password: string;
    setPassword: (p: string) => void;
    error: string;
}> = ({ onSubmit, onClose, password, setPassword, error }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm">
             <h2 className="text-2xl font-bold text-brand-dark mb-4">Acceso de Administrador</h2>
             <form onSubmit={onSubmit}>
                <label htmlFor="admin-pass" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input id="admin-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary" autoFocus />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex justify-end mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 mr-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-dark">Entrar</button>
                </div>
             </form>
        </div>
    </div>
);


const App: React.FC = () => {
    const [view, setView] = useState<View>('home');
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
    const [adminPassword, setAdminPassword] = useState<string>('');
    const [adminError, setAdminError] = useState<string>('');
    const [selectedIncidentType, setSelectedIncidentType] = useState<IncidentType | null>(null);
    const [selectedIncidentDetail, setSelectedIncidentDetail] = useState<Incident | null>(null);

    const { incidents, addIncident, updateIncidentStatus, loading, config, updateConfig } = useIncidents();

    const handleReportClick = (type: IncidentType) => {
        setSelectedIncidentType(type);
    };
    
    const closeReportForm = useCallback(() => {
        setSelectedIncidentType(null);
    }, []);

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPassword === ADMIN_PASSWORD) {
            setIsAdmin(true);
            setShowAdminLogin(false);
            setAdminError('');
            setAdminPassword('');
            setView('list');
        } else {
            setAdminError('Contraseña incorrecta.');
        }
    };

    const handleLogout = () => {
        setIsAdmin(false);
        setView('home');
    };

    const renderHeader = () => (
        <header className="bg-brand-primary text-white p-4 shadow-md flex justify-between items-center">
            <h1 className="text-2xl font-bold">Gestor de Incidencias</h1>
            {isAdmin ? (
                <div className="flex items-center gap-4">
                     <button
                        onClick={() => setView('admin')}
                        className="flex items-center px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                        aria-label="Ir al panel de configuración"
                    >
                        <IconSettings />
                        Configuración
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center px-3 py-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                        aria-label="Cerrar sesión de administrador"
                    >
                        <IconLogout />
                        Salir
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setShowAdminLogin(true)}
                    className="flex items-center px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                    <IconAdmin />
                    Acceso Admin
                </button>
            )}
        </header>
    );

    const HomeView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <HomeButton icon={<IconComputer />} title="Reportar Incidencia Informática" onClick={() => handleReportClick(IncidentType.IT)} />
            <HomeButton icon={<IconBuilding />} title="Reportar Incidencia de Edificios" onClick={() => handleReportClick(IncidentType.Building)} />
            <HomeButton icon={<IconList />} title="Ver Incidencias" onClick={() => setView('list')} />
            <HomeButton icon={<IconChart />} title="Estadísticas" onClick={() => setView('stats')} />
        </div>
    );
    
    const HomeButton = ({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick: () => void }) => (
        <button onClick={onClick} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 flex flex-col items-center justify-center text-center text-brand-dark hover:text-brand-primary">
            {icon}
            <span className="mt-4 text-lg font-semibold">{title}</span>
        </button>
    );

    const ListView = () => {
        const incidentsToShow = isAdmin
            ? incidents.filter(incident => incident.status !== IncidentStatus.Resolved)
            : incidents;

        return (
            <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-3xl font-bold text-brand-dark mb-6">{isAdmin ? "Gestión de Incidencias Pendientes" : "Listado de Incidencias"}</h2>
                 {incidentsToShow.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <p className="text-xl text-gray-500">{isAdmin ? "¡Felicidades! No hay incidencias pendientes." : "No hay incidencias reportadas. ¡Todo en orden!"}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {incidentsToShow.map(incident => <IncidentCard key={incident.id} incident={incident} />)}
                    </div>
                )}
            </div>
        );
    };

    const IncidentCard = ({ incident }: { incident: Incident }) => {
        const statusStyle = STATUS_COLORS[incident.status];
        return (
            <div className="bg-white p-5 rounded-xl shadow-md transition-shadow hover:shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between sm:items-start">
                    <div>
                        <div className="flex items-center mb-2">
                             <span className={`px-3 py-1 text-sm font-bold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>{incident.status}</span>
                             <p className={`ml-3 font-semibold ${incident.type === IncidentType.IT ? 'text-brand-primary' : 'text-brand-accent'}`}>{incident.type}</p>
                        </div>
                        <p className="font-bold text-lg text-brand-dark">{incident.location}</p>
                        <p className="text-sm text-gray-500">{incident.timestamp}</p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col sm:items-end sm:text-right">
                        {isAdmin && (
                            <div className="mb-2 w-full sm:w-auto">
                                <select 
                                    value={incident.status}
                                    onChange={(e) => updateIncidentStatus(incident.id, e.target.value as IncidentStatus)}
                                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {Object.values(IncidentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                        <button onClick={() => setSelectedIncidentDetail(incident)} className="text-sm text-brand-primary font-semibold hover:underline">
                            Ver Detalles
                        </button>
                    </div>
                </div>
                {isAdmin && incident.contact && <p className="mt-3 text-sm text-gray-600">Contacto: <span className="font-medium">{incident.contact}</span></p>}
            </div>
        );
    };

    const AdminView = () => {
        const [currentConfig, setCurrentConfig] = useState(config);

        const handleSave = () => {
            updateConfig(currentConfig);
            alert("Configuración guardada.");
        };

        return (
             <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-3xl font-bold text-brand-dark mb-6">Panel de Administración</h2>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-brand-dark mb-4">Configuración</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">URL Hoja de Cálculo</label>
                            <input type="text" value={currentConfig.spreadsheetUrl} onChange={(e) => setCurrentConfig({...currentConfig, spreadsheetUrl: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Email Notificaciones (IT)</label>
                            <input type="email" value={currentConfig.itEmail} onChange={(e) => setCurrentConfig({...currentConfig, itEmail: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700">Email Notificaciones (Edificios)</label>
                            <input type="email" value={currentConfig.buildingEmail} onChange={(e) => setCurrentConfig({...currentConfig, buildingEmail: e.target.value})} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary" />
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handleSave} className="px-6 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-dark transition-colors">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const DetailModal = () => {
        if (!selectedIncidentDetail) return null;
        const incident = selectedIncidentDetail;
        const statusStyle = STATUS_COLORS[incident.status];
        return (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={() => setSelectedIncidentDetail(null)}>
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-full overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setSelectedIncidentDetail(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <div className="flex items-center mb-4">
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>{incident.status}</span>
                        <p className={`ml-3 text-xl font-semibold ${incident.type === IncidentType.IT ? 'text-brand-primary' : 'text-brand-accent'}`}>{incident.type}</p>
                    </div>
                    <h2 className="text-2xl font-bold text-brand-dark">{incident.location}</h2>
                    <p className="text-sm text-gray-500 mb-6">{incident.timestamp}</p>
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-800">Descripción</h3>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{incident.description}</p>
                        </div>
                        {incident.suggestions && (
                             <div>
                                <h3 className="font-semibold text-gray-800">Sugerencias del Usuario</h3>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{incident.suggestions}</p>
                            </div>
                        )}
                        {incident.contact && (
                             <div>
                                <h3 className="font-semibold text-gray-800">Contacto</h3>
                                <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{incident.contact}</p>
                            </div>
                        )}

                        {(incident.aiSummary || incident.aiSteps) && (
                            <div className="mt-6 p-4 border-2 border-dashed border-brand-secondary rounded-lg bg-brand-secondary/10">
                                <h3 className="font-bold text-brand-primary flex items-center mb-2"><IconSparkles /> <span className="ml-2">Análisis por IA</span></h3>
                                {incident.aiSummary && <p className="text-gray-700 italic mb-3">"{incident.aiSummary}"</p>}
                                {incident.aiSteps && (
                                    <>
                                        <h4 className="font-semibold text-gray-800">Pasos sugeridos:</h4>
                                        <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                                            {incident.aiSteps.map((step, i) => <li key={i}>{step}</li>)}
                                        </ul>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderView = () => {
        if (view === 'home') return <HomeView />;
        if (view === 'list') return <ListView />;
        if (view === 'stats') return <StatsDashboard incidents={incidents} />;
        if (view === 'admin' && isAdmin) return <AdminView />;
        // Default to home if admin tries to access panel without being logged in
        if (view === 'admin' && !isAdmin) {
            setView('home');
            return <HomeView />;
        }
    };
    
    const showBackButton = (isAdmin && view !== 'list') || (!isAdmin && view !== 'home');

    return (
        <div className="min-h-screen bg-brand-light font-sans">
            {renderHeader()}
            <main className="max-w-7xl mx-auto py-6">
                 {showBackButton && (
                    <button onClick={() => setView(isAdmin ? 'list' : 'home')} className="mb-6 ml-4 sm:ml-6 md:ml-8 flex items-center text-brand-primary font-semibold hover:text-brand-dark transition-colors">
                        <IconBack />
                        {isAdmin ? 'Volver a Incidencias' : 'Volver al Inicio'}
                    </button>
                )}
                {renderView()}
            </main>
            
            {selectedIncidentType && <ReportForm incidentType={selectedIncidentType} addIncident={addIncident} onClose={closeReportForm} loading={loading} />}
            {showAdminLogin && <AdminLoginModal 
                onSubmit={handleAdminLogin}
                onClose={() => setShowAdminLogin(false)}
                password={adminPassword}
                setPassword={setAdminPassword}
                error={adminError}
            />}
            {selectedIncidentDetail && <DetailModal />}
        </div>
    );
};

export default App;