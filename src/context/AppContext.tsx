import React, { createContext, useContext, useState } from 'react';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  reportingYear: string;
  setReportingYear: (yr: string) => void;
  reportingYearsList: string[];
  selectedSubsidiary: string;
  setSelectedSubsidiary: (subId: string) => void;
  selectedBusinessUnit: string;
  setSelectedBusinessUnit: (buId: string) => void;
  selectedProject: string;
  setSelectedProject: (projId: string) => void;
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;
  toggleAiAssistant: () => void;
  toasts: ToastMessage[];
  addToast: (title: string, description?: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reportingYear, setReportingYear] = useState('FY 2025-26');
  const reportingYearsList = ['FY 2025-26', 'FY 2024-25', 'FY 2023-24'];

  const [selectedSubsidiary, setSelectedSubsidiary] = useState('all');
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState('all');
  const [selectedProject, setSelectedProject] = useState('all');

  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, description, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleAiAssistant = () => {
    setIsAiAssistantOpen(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        reportingYear,
        setReportingYear,
        reportingYearsList,
        selectedSubsidiary,
        setSelectedSubsidiary,
        selectedBusinessUnit,
        setSelectedBusinessUnit,
        selectedProject,
        setSelectedProject,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        toggleAiAssistant,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
