import { request } from "./client";
import type {
  BackendProject,
  ProjectCreateInput,
  ProjectUpdateInput,
  ProjectIntelligenceResponse,
} from "../types";

export interface GetProjectsParams {
  watershed_id?: number;
  status_filter?: string;
  skip?: number;
  limit?: number;
}

export const projectsApi = {
  getAll: async (params: GetProjectsParams = {}): Promise<BackendProject[]> => {
    return request<BackendProject[]>("/projects/", {
      method: "GET",
      params: {
        watershed_id: params.watershed_id,
        status_filter: params.status_filter,
        skip: params.skip || 0,
        limit: params.limit || 100,
      },
    });
  },

  getById: async (projectId: number): Promise<BackendProject> => {
    return request<BackendProject>(`/projects/${projectId}`);
  },

  getIntelligence: async (projectId: number): Promise<ProjectIntelligenceResponse> => {
    return request<ProjectIntelligenceResponse>(`/projects/${projectId}/intelligence`);
  },

  create: async (data: ProjectCreateInput): Promise<BackendProject> => {
    return request<BackendProject>("/projects/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    projectId: number,
    data: ProjectUpdateInput
  ): Promise<BackendProject> => {
    return request<BackendProject>(`/projects/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (projectId: number): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/projects/${projectId}`, {
      method: "DELETE",
    });
  },
};
