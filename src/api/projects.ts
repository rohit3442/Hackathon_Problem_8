import { apiClient } from './client';
import { Project } from '../types';

export interface ProjectDetail extends Project {
  environmentalData?: any;
  socialData?: any;
  governanceData?: any;
  documents?: any[];
  validations?: any[];
  workflows?: any[];
}

export const projectsApi = {
  getProjects: async (): Promise<Project[]> => {
    const res = await apiClient.get<Project[]>('/projects');
    return res.data;
  },

  getProjectById: async (id: string): Promise<ProjectDetail> => {
    const res = await apiClient.get<ProjectDetail>(`/projects/${id}`);
    return res.data;
  },

  createProject: async (data: Partial<Project>): Promise<Project> => {
    const res = await apiClient.post<Project>('/projects', data);
    return res.data;
  },

  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const res = await apiClient.put<Project>(`/projects/${id}`, data);
    return res.data;
  }
};
