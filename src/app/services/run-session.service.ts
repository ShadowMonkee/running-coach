import { Injectable, signal, computed } from '@angular/core';
import { Session, Interval, IntervalState, ActiveSessionState } from '../models/training.models';
import { VoiceCoachService } from './voice-coach.service';

const STORAGE_KEY = 'rc_completed_sessions';

@Injectable({ providedIn: 'root' })
export class RunSessionService {
  // ── Active session ──────────────────────────────────────────
  readonly activeSession = signal<ActiveSessionState | null>(null);

  // ── Timer state ─────────────────────────────────────────────
  readonly elapsed = signal(0);
  readonly isRunning = signal(false);
  readonly isPaused = signal(false);
  readonly isDone = signal(false);

  // ── Completed sessions ───────────────────────────────────────
  readonly completed = signal<Set<string>>(this.loadCompleted());

  readonly completedCount = computed(() => this.completed().size);

  // ── Interval tracking refs ───────────────────────────────────
  private lastIdx = -1;
  private warned30 = false;
  private warned10 = false;
  private timerHandle?: ReturnType<typeof setInterval>;

  constructor(private voice: VoiceCoachService) {}

  // ── Session setup ────────────────────────────────────────────
  setSession(session: Session, sessionKey: string | null, weekLabel: string): void {
    this.activeSession.set({ session, sessionKey, weekLabel });
    this.elapsed.set(0);
    this.isRunning.set(false);
    this.isPaused.set(false);
    this.isDone.set(false);
    this.clearTimer();
  }

  // ── Timer controls ───────────────────────────────────────────
  start(): void {
    const session = this.activeSession();
    if (!session?.session.intervals) return;
    this.isRunning.set(true);
    this.isPaused.set(false);
    this.lastIdx = -1;
    this.warned30 = false;
    this.warned10 = false;

    const firstType = session.session.intervals![0]?.type ?? 'run';
    this.voice.announceStart(firstType);

    this.startTimer();
  }

  pause(): void {
    this.isPaused.set(true);
    this.voice.cancel();
    this.clearTimer();
  }

  resume(): void {
    this.isPaused.set(false);
    this.voice.speak('Resuming!');
    this.startTimer();
  }

  stop(): void {
    this.isRunning.set(false);
    this.isPaused.set(false);
    this.voice.cancel();
    this.clearTimer();
  }

  // ── Completion ───────────────────────────────────────────────
  markComplete(): void {
    const key = this.activeSession()?.sessionKey;
    if (key) {
      const updated = new Set(this.completed());
      updated.add(key);
      this.completed.set(updated);
      this.saveCompleted(updated);
    }
  }

  isSessionCompleted(key: string): boolean {
    return this.completed().has(key);
  }

  // ── Interval state ───────────────────────────────────────────
  getIntervalState(elapsed: number, intervals: Interval[]): IntervalState {
    let t = 0;
    for (let i = 0; i < intervals.length; i++) {
      if (elapsed < t + intervals[i].duration) {
        return { idx: i, iv: intervals[i], left: t + intervals[i].duration - elapsed, done: false };
      }
      t += intervals[i].duration;
    }
    return { idx: intervals.length, iv: null, left: 0, done: true };
  }

  totalDuration(intervals: Interval[]): number {
    return intervals.reduce((s, i) => s + i.duration, 0);
  }

  // ── Private ──────────────────────────────────────────────────
  private startTimer(): void {
    this.clearTimer();
    this.timerHandle = setInterval(() => this.tick(), 1000);
  }

  private clearTimer(): void {
    if (this.timerHandle != null) {
      clearInterval(this.timerHandle);
      this.timerHandle = undefined;
    }
  }

  private tick(): void {
    const session = this.activeSession();
    if (!session?.session.intervals) return;
    const intervals = session.session.intervals;
    const newElapsed = this.elapsed() + 1;
    this.elapsed.set(newElapsed);

    const state = this.getIntervalState(newElapsed, intervals);

    if (state.done) {
      this.isDone.set(true);
      this.isRunning.set(false);
      this.clearTimer();
      this.voice.announceComplete();
      return;
    }

    const { idx, iv, left } = state;

    if (idx !== this.lastIdx) {
      this.lastIdx = idx;
      this.warned30 = false;
      this.warned10 = false;
      this.voice.announceSegment(iv!.type);
    }

    if (left === 30 && !this.warned30) {
      this.warned30 = true;
      const nextLabel = idx < intervals.length - 1 ? intervals[idx + 1].label : undefined;
      this.voice.announceWarning(30, nextLabel);
    }

    if (left === 10 && !this.warned10) {
      this.warned10 = true;
      this.voice.announceWarning(10);
    }
  }

  private loadCompleted(): Set<string> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  }

  private saveCompleted(set: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
    } catch { /* ignore */ }
  }
}
