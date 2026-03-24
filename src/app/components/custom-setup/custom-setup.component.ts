import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TrainingDataService } from '../../services/training-data.service';
import { RunSessionService } from '../../services/run-session.service';
import { FormatTimePipe } from '../../pipes/format-time.pipe';

@Component({
  selector: 'app-custom-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatTimePipe],
  templateUrl: './custom-setup.component.html',
  styleUrl: './custom-setup.component.scss'
})
export class CustomSetupComponent {
  private router = inject(Router);
  private dataService = inject(TrainingDataService);
  private sessionService = inject(RunSessionService);

  warmup = signal(3);
  run = signal(3);
  walk = signal(2);
  sets = signal(6);
  cooldown = signal(3);

  builtSession = computed(() =>
    this.dataService.buildCustomSession(
      this.warmup(), this.run(), this.walk(), this.sets(), this.cooldown()
    )
  );

  totalSeconds = computed(() => {
    const s = this.builtSession();
    if (!s.intervals) return 0;
    return s.intervals.reduce((acc, i) => acc + i.duration, 0);
  });

  ivColor(type: string): string {
    const map: Record<string, string> = {
      run: 'var(--run)', walk: 'var(--walk)',
      warmup: 'var(--warmup)', cooldown: 'var(--cooldown)'
    };
    return map[type] ?? 'var(--accent)';
  }

  startCustomRun(): void {
    const session = this.builtSession();
    this.sessionService.setSession(session, null, 'Custom Run');
    this.router.navigate(['/run']);
  }
}
