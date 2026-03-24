import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VoiceCoachService {
  private synth = window.speechSynthesis;

  speak(text: string, rate = 1.05): void {
    if (!this.synth) return;
    this.synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    this.synth.speak(u);
  }

  announceSegment(type: string): void {
    const map: Record<string, string> = {
      run: 'Run!',
      walk: 'Walk now. Recover.',
      warmup: 'Warm up. Easy walk.',
      cooldown: 'Cool down, almost done!',
      tempo: 'Tempo pace. Push it!'
    };
    this.speak(map[type] ?? 'Go!');
  }

  announceWarning(secondsLeft: number, nextLabel?: string): void {
    if (secondsLeft === 30) {
      this.speak(nextLabel ? `30 seconds, then ${nextLabel}` : '30 seconds to finish!');
    } else if (secondsLeft === 10) {
      this.speak('10 seconds!');
    }
  }

  announceStart(firstType: string): void {
    this.speak(firstType === 'warmup'
      ? 'Starting session. Begin your warm-up walk.'
      : "Let's go!");
  }

  announceComplete(): void {
    this.speak('Session complete! You absolutely crushed it. Amazing work!');
  }

  cancel(): void {
    this.synth?.cancel();
  }
}
