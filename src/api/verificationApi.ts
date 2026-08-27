import { request } from "./client";
import type { BackendVerification } from "../types";

export const verificationApi = {
  verifyProject: async (
    projectId: number,
    params: {
      ndvi_change?: number | null;
      water_change_percent?: number | null;
    } = {}
  ): Promise<BackendVerification> => {
    return request<BackendVerification>(`/verification/project/${projectId}`, {
      method: "POST",
      params: {
        ndvi_change: params.ndvi_change ?? undefined,
        water_change_percent: params.water_change_percent ?? undefined,
      },
    });
  },

  getHistory: async (projectId: number): Promise<BackendVerification[]> => {
    return request<BackendVerification[]>(`/verification/project/${projectId}/history`);
  },
};
