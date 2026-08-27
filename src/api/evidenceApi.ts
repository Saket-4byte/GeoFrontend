import { request } from "./client";
import type { BackendFieldEvidence } from "../types";

export const evidenceApi = {
  upload: async (
    projectId: number,
    file: File,
    options: {
      latitude?: number | null;
      longitude?: number | null;
      description?: string | null;
      captured_at?: string | null;
    } = {}
  ): Promise<BackendFieldEvidence> => {
    const formData = new FormData();
    formData.append("project_id", String(projectId));
    formData.append("file", file);

    if (options.latitude !== undefined && options.latitude !== null) {
      formData.append("latitude", String(options.latitude));
    }
    if (options.longitude !== undefined && options.longitude !== null) {
      formData.append("longitude", String(options.longitude));
    }
    if (options.description) {
      formData.append("description", options.description);
    }
    if (options.captured_at) {
      formData.append("captured_at", options.captured_at);
    }

    return request<BackendFieldEvidence>("/evidence/upload", {
      method: "POST",
      body: formData,
    });
  },

  getByProject: async (projectId: number): Promise<BackendFieldEvidence[]> => {
    return request<BackendFieldEvidence[]>(`/evidence/project/${projectId}`);
  },

  getById: async (evidenceId: number): Promise<BackendFieldEvidence> => {
    return request<BackendFieldEvidence>(`/evidence/${evidenceId}`);
  },
};
