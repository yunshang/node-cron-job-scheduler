export interface Test {
  code: number;
  floor: string;
  message: string;
  position: number[];
  site: Site;
  timestamp: number;
  trace_id: string;
}

export interface Floor {
  certainty: number;
  id: string;
  timestamp: number;
  message: string;
}
export interface Position {
  accuracy: number;
  certainty: number;
  data_available: boolean;
  heading?: number;
  height?: number;
  point: number[];
  posi_type: string;
  status?: number;
  timestamp?: number;
}
export interface Site {
  certainty: number;
  id: string;
  timestamp?: number;
}
