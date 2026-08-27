import { request } from "./client";
import type {
  BackendSatelliteAnalysis,
  SatelliteAnalysisCreateInput,
} from "../types";

export const satelliteApi = {
  analyzeProject: async (
    projectId: number,
    data: SatelliteAnalysisCreateInput
  ): Promise<BackendSatelliteAnalysis> => {
    return request<BackendSatelliteAnalysis>(`/satellite/project/${projectId}/analyze`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getHistory: async (projectId: number): Promise<BackendSatelliteAnalysis[]> => {
    return request<BackendSatelliteAnalysis[]>(`/satellite/project/${projectId}`);
  },
};
