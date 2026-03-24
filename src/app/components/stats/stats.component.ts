import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrainingDataService } from '../../services/training-data.service';
import { RunSessionService } from '../../services/run-session.service';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.scss'
})
export class StatsComponent {
  private dataService = inject(TrainingDataService);
  private sessionService = inject(RunSessionService);

  totalSessions = this.dataService.totalRunningSessions;
  completedCount = computed(() => this.sessionService.completedCount());
  progress = computed(() => Math.round((this.completedCount() / this.totalSessions) * 100));
  currentWeek = computed(() => Math.min(16, Math.max(1, Math.ceil(this.completedCount() / (this.totalSessions / 16)))));
  weeksLeft = computed(() => Math.max(0, 17 - this.currentWeek()));
  estimatedMinutes = computed(() => this.completedCount() * 33);

  // SVG ring
  readonly radius = 58;
  readonly circumference = 2 * Math.PI * this.radius;
  dashOffset = computed(() => this.circumference * (1 - this.progress() / 100));

  raceDate = 'mid-July 2026';
  startDate = 'March 24, 2026';
}
