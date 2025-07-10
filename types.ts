export enum IncidentType {
  IT = 'Informática',
  Building = 'Edificios',
}

export enum IncidentStatus {
  Reported = 'Notificada',
  Received = 'Recibida',
  InProgress = 'En Proceso',
  Resolved = 'Resuelta',
}

export interface Incident {
  id: string;
  type: IncidentType;
  location: string;
  timestamp: string;
  description: string;
  suggestions?: string;
  contact?: string;
  status: IncidentStatus;
  aiSummary?: string;
  aiSteps?: string[];
  resolvedTimestamp?: string;
}

export type View = 'home' | 'list' | 'stats' | 'admin';

export interface AppConfig {
    spreadsheetUrl: string;
    itEmail: string;
    buildingEmail: string;
}