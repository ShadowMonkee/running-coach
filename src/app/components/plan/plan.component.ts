import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TrainingDataService } from '../../services/training-data.service';
import { RunSessionService } from '../../services/run-session.service';
import { WeekPlan, Session } from '../../models/training.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plan.component.html',
  styleUrl: './plan.component.scss'
})
export class PlanComponent {
  private router = inject(Router);
  private dataService = inject(TrainingDataService);
  sessionService = inject(RunSessionService);

  expandedWeek = signal<number | string | null>(null);
  showMaintenance = signal(false);

  plan = this.dataService.plan;
  maintenance = this.dataService.maintenanceWeek;
  totalSessions = this.dataService.totalRunningSessions;

  completedCount = computed(() => this.sessionService.completedCount());
  progress = computed(() => Math.round((this.completedCount() / this.totalSessions) * 100));
  planComplete = computed(() => this.completedCount() >= this.totalSessions);

  weeksToShow = computed((): WeekPlan[] => {
    if (this.planComplete() || this.showMaintenance()) {
      return [...this.plan, this.maintenance];
    }
    return this.plan;
  });

  phaseColor(phase: string): string {
    const map: Record<string, string> = {
      'Foundation': 'var(--phase-foundation)',
      'Base Building': 'var(--phase-base)',
      'HM Training': 'var(--phase-hm)',
      'Taper': 'var(--phase-taper)',
      'Race Week': 'var(--phase-race)',
      'Maintenance': 'var(--phase-maintenance)'
    };
    return map[phase] ?? 'var(--text-muted)';
  }

  sessionColor(type: string): string {
    const map: Record<string, string> = {
      easy: 'var(--run)', long: 'var(--long)', tempo: 'var(--tempo)',
      intervals: 'var(--intervals)', 'run-walk': 'var(--walk)',
      cross: '#4ade80', rest: 'var(--text-dim)', race: 'var(--accent)'
    };
    return map[type] ?? 'var(--accent)';
  }

  sessionLabel(type: string): string {
    const map: Record<string, string> = {
      easy: 'Easy', long: 'Long Run', tempo: 'Tempo', intervals: 'Speed',
      'run-walk': 'Run/Walk', cross: 'Cross', rest: 'Rest', race: 'Race Day'
    };
    return map[type] ?? type;
  }

  weekDoneCount(week: WeekPlan, weekIndex: number): number {
    return week.days.filter(d => {
      const k = `${weekIndex}-${d.day}`;
      return d.session.type !== 'rest' && d.session.type !== 'cross' && this.sessionService.isSessionCompleted(k);
    }).length;
  }

  weekTotal(week: WeekPlan): number {
    return week.days.filter(d => d.session.type !== 'rest' && d.session.type !== 'cross').length;
  }

  toggleWeek(week: number | string): void {
    this.expandedWeek.set(this.expandedWeek() === week ? null : week);
  }

  selectSession(session: Session, weekIndex: number, day: string, weekNum: number | string): void {
    if (!session.intervals) return;
    const key = `${weekIndex}-${day}`;
    const label = `Week ${weekNum} · ${day}`;
    this.sessionService.setSession(session, key, label);
    this.router.navigate(['/prep']);
  }
}
