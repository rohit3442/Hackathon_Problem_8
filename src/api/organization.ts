import { apiClient } from './client';
import { Subsidiary, BusinessUnit, Project } from '../types';

export interface OrganizationStructure {
  organization: {
    id: string;
    name: string;
    cin: string;
    reportingYear: string;
    registeredOffice: string;
    totalEmployees: number;
  };
  subsidiaries: Subsidiary[];
  businessUnits: BusinessUnit[];
  projects: Project[];
}

export const organizationApi = {
  getOrganization: async (): Promise<OrganizationStructure> => {
    const res = await apiClient.get<OrganizationStructure>('/organization');
    return res.data;
  },

  getSubsidiaries: async (): Promise<Subsidiary[]> => {
    const res = await apiClient.get<Subsidiary[]>('/subsidiaries');
    return res.data;
  },

  getSubsidiaryById: async (id: string): Promise<Subsidiary & { businessUnits: BusinessUnit[]; projects: Project[] }> => {
    const res = await apiClient.get(`/subsidiaries/${id}`);
    return res.data;
  },

  getBusinessUnits: async (): Promise<BusinessUnit[]> => {
    const res = await apiClient.get<BusinessUnit[]>('/business-units');
    return res.data;
  },

  getBusinessUnitById: async (id: string): Promise<BusinessUnit & { projects: Project[] }> => {
    const res = await apiClient.get(`/business-units/${id}`);
    return res.data;
  },

  getConsolidation: async () => {
    const res = await apiClient.get('/consolidation');
    return res.data;
  }
};
