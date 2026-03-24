import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { RunSessionService } from '../../services/run-session.service';
import { FormatTimePipe } from '../../pipes/format-time.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-active-run',
  standalone: true,
  imports: [CommonModule, FormatTimePipe],
  templateUrl: './active-run.component.html',
  styleUrl: './active-run.component.scss'
})
export class ActiveRunComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  sessionService = inject(RunSessionService);

  activeState = computed(() => this.sessionService.activeSession());
  elapsed = computed(() => this.sessionService.elapsed());
  isRunning = computed(() => this.sessionService.isRunning());
  isPaused = computed(() => this.sessionService.isPaused());
  isDone = computed(() => this.sessionService.isDone());

  intervalState = computed(() => {
    const s = this.activeState();
    if (!s?.session.intervals) return null;
    return this.sessionService.getIntervalState(this.elapsed(), s.session.intervals);
  });

  totalDuration = computed(() => {
    const s = this.activeState();
    if (!s?.session.intervals) return 0;
    return this.sessionService.totalDuration(s.session.intervals);
  });

  progress = computed(() => {
    const total = this.totalDuration();
    return total > 0 ? Math.min(this.elapsed() / total, 1) : 0;
  });

  nextInterval = computed(() => {
    const s = this.activeState();
    const st = this.intervalState();
    if (!s?.session.intervals || !st || st.done) return null;
    const idx = st.idx;
    return idx < s.session.intervals.length - 1 ? s.session.intervals[idx + 1] : null;
  });

  currentColor = computed(() => {
    if (this.isDone()) return 'var(--accent)';
    const st = this.intervalState();
    if (!st?.iv) return 'var(--text-dim)';
    return this.ivColor(st.iv.type);
  });

  ngOnInit(): void {
    if (!this.activeState()) {
      this.router.navigate(['/plan']);
    }
  }

  ngOnDestroy(): void {
    this.sessionService.stop();
  }

  ivColor(type: string): string {
    const map: Record<string, string> = {
      run: 'var(--run)', walk: 'var(--walk)', warmup: 'var(--warmup)',
      cooldown: 'var(--cooldown)', tempo: 'var(--tempo)'
    };
    return map[type] ?? 'var(--accent)';
  }

  start(): void {
    this.sessionService.start();
  }

  togglePause(): void {
    if (this.isPaused()) {
      this.sessionService.resume();
    } else {
      this.sessionService.pause();
    }
  }

  stop(): void {
    this.sessionService.stop();
    this.router.navigate(['/prep']);
  }

  markCompleteAndLeave(): void {
    this.sessionService.markComplete();
    this.router.navigate(['/plan']);
  }

  goBackToPlan(): void {
    this.router.navigate(['/plan']);
  }

  getSegmentStatus(segIdx: number): 'done' | 'active' | 'upcoming' {
    const st = this.intervalState();
    if (!st || !this.isRunning()) return 'upcoming';
    if (segIdx < st.idx) return 'done';
    if (segIdx === st.idx) return 'active';
    return 'upcoming';
  }
}
