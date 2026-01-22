export interface PerfMetrics {
  url: string;
  timestamp: string;
  domContentLoaded: number;
  loadEvent: number;
  lcp?: number;

  avgFps: number;
  minFps: number;
  fpsSampleDurationMs: number;

  apiCalls: {
    url: string;
    responseTime: number;
  }[];

  failedRequests: {
    url: string;
    method: string;
    status?: number;
    failure?: string;
    resourceType: string;
  }[];
}
