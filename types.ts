export interface TimelinePoints {
  start: string;
  p50: string;
  p80: string;
  p100: string;
}

export interface EventData {
  id: string;
  date: string;
  fullDate: string;
  name: string;
  warningType: string;
  involvedTowns: number;
  sites: number;
  people: number;
  progress: number;
  msg: string;
  duration: string;
  timeline: TimelinePoints;
}

export interface TownData {
  name: string;
  fullName: string;
  status: number; // 1: Red/Unfinished, 2: Green/Finished, 3: High Heat (Summary), 0: Grey/None
}

export type MapMode = 'grid' | 'geo';