import { request } from "./client";
import type { DashboardOverviewResponse } from "../types";

export const dashboardApi = {
  getOverview: async (): Promise<DashboardOverviewResponse> => {
    return request<DashboardOverviewResponse>("/dashboard/overview");
  },
};
