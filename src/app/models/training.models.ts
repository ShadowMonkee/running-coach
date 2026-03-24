export type SegmentType = 'warmup' | 'run' | 'walk' | 'cooldown' | 'tempo';
export type SessionType = 'easy' | 'long' | 'tempo' | 'intervals' | 'run-walk' | 'cross' | 'rest' | 'race';

export interface Interval {
  type: SegmentType;
  duration: number; // seconds
  label: string;
}

export interface Session {
  type: SessionType;
  name: string;
  desc: string;
  intervals: Interval[] | null;
  duration: number; // minutes
}

export interface DayPlan {
  day: string;
  session: Session;
}

export interface WeekPlan {
  week: number | string;
  phase: string;
  goal: string;
  days: DayPlan[];
}

export interface CustomRunConfig {
  warmup: number;
  run: number;
  walk: number;
  sets: number;
  cooldown: number;
}

export interface ActiveSessionState {
  session: Session;
  sessionKey: string | null;
  weekLabel: string;
}

export interface IntervalState {
  idx: number;
  iv: Interval | null;
  left: number;
  done: boolean;
}
