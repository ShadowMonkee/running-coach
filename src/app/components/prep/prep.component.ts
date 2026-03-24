import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { RunSessionService } from '../../services/run-session.service';
import { FormatTimePipe } from '../../pipes/format-time.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-prep',
  standalone: true,
  imports: [CommonModule, FormatTimePipe],
  templateUrl: './prep.component.html',
  styleUrl: './prep.component.scss'
})
export class PrepComponent {
  private router = inject(Router);
  sessionService = inject(RunSessionService);

  activeState = computed(() => this.sessionService.activeSession());

  totalDuration = computed(() => {
    const s = this.activeState();
    if (!s?.session.intervals) return 0;
    return this.sessionService.totalDuration(s.session.intervals);
  });

  sessionColor(type: string): string {
    const map: Record<string, string> = {
      easy: 'var(--run)', long: 'var(--long)', tempo: 'var(--tempo)',
      intervals: 'var(--intervals)', 'run-walk': 'var(--walk)',
      cross: '#4ade80', rest: 'var(--text-dim)', race: 'var(--accent)'
    };
    return map[type] ?? 'var(--accent)';
  }

  sessionTypeLabel(type: string): string {
    const map: Record<string, string> = {
      easy: 'Easy Run', long: 'Long Run', tempo: 'Tempo', intervals: 'Speed',
      'run-walk': 'Run / Walk', cross: 'Cross-Training', rest: 'Rest', race: 'Race Day'
    };
    return map[type] ?? type;
  }

  ivColor(type: string): string {
    const map: Record<string, string> = {
      run: 'var(--run)', walk: 'var(--walk)', warmup: 'var(--warmup)',
      cooldown: 'var(--cooldown)', tempo: 'var(--tempo)'
    };
    return map[type] ?? 'var(--accent)';
  }

  goBack(): void {
    this.router.navigate(['/plan']);
  }

  startSession(): void {
    this.router.navigate(['/run']);
  }
}
