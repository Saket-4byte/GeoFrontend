import { request } from "./client";
import type {
  BackendWatershed,
  WatershedCreateInput,
  WatershedUpdateInput,
  WatershedHealthResponse,
} from "../types";

export const watershedsApi = {
  getAll: async (skip = 0, limit = 100): Promise<BackendWatershed[]> => {
    return request<BackendWatershed[]>("/watersheds/", {
      method: "GET",
      params: { skip, limit },
    });
  },

  getById: async (watershedId: number): Promise<BackendWatershed> => {
    return request<BackendWatershed>(`/watersheds/${watershedId}`);
  },

  getHealth: async (watershedId: number): Promise<WatershedHealthResponse> => {
    return request<WatershedHealthResponse>(`/watersheds/${watershedId}/health`);
  },

  create: async (data: WatershedCreateInput): Promise<BackendWatershed> => {
    return request<BackendWatershed>("/watersheds/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    watershedId: number,
    data: WatershedUpdateInput
  ): Promise<BackendWatershed> => {
    return request<BackendWatershed>(`/watersheds/${watershedId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (watershedId: number): Promise<{ success: boolean; message: string }> => {
    return request<{ success: boolean; message: string }>(`/watersheds/${watershedId}`, {
      method: "DELETE",
    });
  },
};
