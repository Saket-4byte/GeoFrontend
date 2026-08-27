import { request } from "./client";
import type { BackendAlert } from "../types";

export const alertsApi = {
  getAll: async (unresolvedOnly = true): Promise<BackendAlert[]> => {
    return request<BackendAlert[]>("/alerts/", {
      method: "GET",
      params: { unresolved_only: unresolvedOnly },
    });
  },

  resolve: async (alertId: number): Promise<BackendAlert> => {
    return request<BackendAlert>(`/alerts/${alertId}/resolve`, {
      method: "PUT",
    });
  },
};
