import { apiClient } from './client';

export interface EvidenceDocument {
  id: string;
  projectId: string;
  projectCode?: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'excel' | 'word' | 'image' | 'other';
  fileSize: string;
  category: 'environmental' | 'social' | 'governance';
  subCategory: string;
  description: string;
  uploadedBy: string;
  uploadedAt: string;
  verified: boolean;
  link?: string;
  sha256?: string;
}

export const documentsApi = {
  getDocuments: async (projectId?: string, category?: string): Promise<EvidenceDocument[]> => {
    try {
      const params: any = {};
      if (category && category !== 'all') params.category = category;
      const url = projectId ? `/projects/${projectId}/documents` : '/documents';
      const res = await apiClient.get<EvidenceDocument[]>(url, { params });
      return res.data;
    } catch (e) {
      console.error('Error fetching documents:', e);
      return [];
    }
  },

  uploadDocument: async (projectId: string, doc: Partial<EvidenceDocument>): Promise<EvidenceDocument> => {
    const res = await apiClient.post<EvidenceDocument>(`/projects/${projectId}/documents`, doc);
    return res.data;
  },

  deleteDocument: async (projectId: string, docId: string): Promise<boolean> => {
    await apiClient.delete(`/projects/${projectId}/documents/${docId}`);
    return true;
  }
};
