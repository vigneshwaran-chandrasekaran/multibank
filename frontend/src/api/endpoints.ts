import apiClient from "./client";
import type {
  ApiResponse,
  HistoryCandle,
  HistoryInterval,
  LoginCredentials,
  LoginResponse,
  Ticker,
} from "../types";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post("/auth/logout");
  },
};

export const tickersApi = {
  getAll: async (): Promise<Ticker[]> => {
    const { data } = await apiClient.get<ApiResponse<Ticker[]>>("/tickers");
    return data.data;
  },
  getOne: async (symbol: string): Promise<Ticker> => {
    const { data } = await apiClient.get<ApiResponse<Ticker>>(`/tickers/${symbol}`);
    return data.data;
  },
  getHistory: async (
    symbol: string,
    interval: HistoryInterval = "1d"
  ): Promise<HistoryCandle[]> => {
    const { data } = await apiClient.get<{ data: HistoryCandle[] }>(
      `/tickers/${symbol}/history`,
      { params: { interval } }
    );
    return data.data;
  },
};
