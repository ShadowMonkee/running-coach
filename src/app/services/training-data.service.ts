import { Injectable } from '@angular/core';
import { Interval, Session, WeekPlan, SegmentType } from '../models/training.models';

// ── Interval builders ────────────────────────────────────────────
function seg(type: SegmentType, mins: number, label: string): Interval {
  return { type, duration: Math.round(mins * 60), label };
}
const WU = (m = 3) => seg('warmup', m, 'Warm-up Walk');
const CD = (m = 3) => seg('cooldown', m, 'Cool-down Walk');
const EASY = (m: number) => seg('run', m, 'Easy Run');
const TEMPO_SEG = (m: number) => seg('tempo', m, 'Tempo Run');

function rwIntervals(runM: number, walkM: number, sets: number): Interval[] {
  const out: Interval[] = [];
  for (let i = 0; i < sets; i++) {
    out.push(seg('run', runM, 'Run'));
    if (i < sets - 1) out.push(seg('walk', walkM, 'Recovery Walk'));
  }
  return out;
}

function speedIntervals(fastM: number, recovM: number, sets: number): Interval[] {
  const out: Interval[] = [];
  for (let i = 0; i < sets; i++) {
    out.push(seg('run', fastM, 'Fast Interval'));
    out.push(seg('walk', recovM, 'Recovery'));
  }
  return out;
}

// ── Session builders ─────────────────────────────────────────────
function mk(type: Session['type'], name: string, desc: string, intervals: Interval[] | null, duration: number): Session {
  return { type, name, desc, intervals, duration };
}

const REST: Session = mk('rest', 'Rest Day', 'Full recovery. Light stretching if you like.', null, 0);
const CROSS: Session = mk('cross', 'Cross-Training', 'Cycling, swimming, yoga or strength. 30–45 min, low impact.', null, 0);

function rwS(runM: number, walkM: number, sets: number): Session {
  return mk('run-walk',
    `Run/Walk — ${runM}min run / ${walkM}min walk × ${sets}`,
    `Run ${runM}min, walk ${walkM}min, repeat ${sets} times. Warm-up & cool-down included.`,
    [WU(3), ...rwIntervals(runM, walkM, sets), CD(3)],
    Math.round(6 + sets * (runM + walkM))
  );
}

function easyS(m: number): Session {
  return mk('easy', `Easy Run — ${m}min`,
    'Comfortable, conversational pace. You should be able to speak full sentences.',
    [WU(3), EASY(m - 6), CD(3)], m
  );
}

function longS(m: number, km: number): Session {
  return mk('long', `Long Run — ~${km}km`,
    'The most important run of the week. Slow and steady. Never push the pace.',
    [WU(5), EASY(m - 10), CD(5)], m
  );
}

function tempoS(total: number, t: number): Session {
  return mk('tempo', `Tempo Run — ${total}min`,
    `10min warm-up, ${t}min at comfortably hard pace, 10min cool-down.`,
    [WU(10), TEMPO_SEG(t), CD(10)], total
  );
}

function intS(fastM: number, recovM: number, sets: number): Session {
  return mk('intervals', `Intervals — ${sets}×${fastM}min`,
    `10min warm-up → ${sets} × ${fastM}min fast with ${recovM}min recovery → 10min cool-down.`,
    [WU(10), ...speedIntervals(fastM, recovM, sets), CD(10)],
    Math.round(20 + sets * (fastM + recovM))
  );
}

@Injectable({ providedIn: 'root' })
export class TrainingDataService {

  readonly plan: WeekPlan[] = [
    { week: 1, phase: 'Foundation', goal: 'Just get moving. Run/walk is perfect — no shame, all gain.', days: [
      { day: 'Mon', session: rwS(1, 1.5, 8) }, { day: 'Tue', session: REST },
      { day: 'Wed', session: rwS(1, 1.5, 8) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: rwS(1, 1.5, 10) }, { day: 'Sat', session: longS(30, 3) }, { day: 'Sun', session: REST }
    ]},
    { week: 2, phase: 'Foundation', goal: 'Slightly longer intervals. Your legs are waking up.', days: [
      { day: 'Mon', session: rwS(1.5, 2, 6) }, { day: 'Tue', session: REST },
      { day: 'Wed', session: rwS(1.5, 2, 6) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: rwS(2, 2, 6) }, { day: 'Sat', session: longS(35, 3.5) }, { day: 'Sun', session: REST }
    ]},
    { week: 3, phase: 'Foundation', goal: 'Pushing to 5-minute intervals. Almost ready for continuous running.', days: [
      { day: 'Mon', session: rwS(3, 2, 5) }, { day: 'Tue', session: REST },
      { day: 'Wed', session: rwS(3, 2, 5) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: rwS(5, 2, 4) }, { day: 'Sat', session: longS(40, 4) }, { day: 'Sun', session: REST }
    ]},
    { week: 4, phase: 'Base Building', goal: 'First week of continuous running. Milestone!', days: [
      { day: 'Mon', session: easyS(20) }, { day: 'Tue', session: easyS(20) },
      { day: 'Wed', session: easyS(25) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(20) }, { day: 'Sat', session: longS(45, 5) }, { day: 'Sun', session: REST }
    ]},
    { week: 5, phase: 'Base Building', goal: 'Your first speed session. Welcome to intervals!', days: [
      { day: 'Mon', session: easyS(25) }, { day: 'Tue', session: easyS(20) },
      { day: 'Wed', session: intS(3, 1.5, 4) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(25) }, { day: 'Sat', session: longS(50, 6) }, { day: 'Sun', session: REST }
    ]},
    { week: 6, phase: 'Base Building', goal: 'First tempo run. Comfortably hard — not flat out.', days: [
      { day: 'Mon', session: easyS(30) }, { day: 'Tue', session: easyS(25) },
      { day: 'Wed', session: tempoS(30, 10) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(25) }, { day: 'Sat', session: longS(55, 7) }, { day: 'Sun', session: REST }
    ]},
    { week: 7, phase: 'Base Building', goal: 'More speed work. Real fitness is building now.', days: [
      { day: 'Mon', session: easyS(30) }, { day: 'Tue', session: easyS(25) },
      { day: 'Wed', session: intS(3, 1.5, 5) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(30) }, { day: 'Sat', session: longS(60, 9) }, { day: 'Sun', session: REST }
    ]},
    { week: 8, phase: 'Base Building', goal: 'Recovery week. Pull back — let your body consolidate.', days: [
      { day: 'Mon', session: easyS(25) }, { day: 'Tue', session: easyS(20) },
      { day: 'Wed', session: easyS(25) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(20) }, { day: 'Sat', session: longS(45, 6) }, { day: 'Sun', session: REST }
    ]},
    { week: 9, phase: 'HM Training', goal: 'Real half marathon training begins. Long run is king.', days: [
      { day: 'Mon', session: easyS(35) }, { day: 'Tue', session: easyS(30) },
      { day: 'Wed', session: tempoS(35, 15) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(30) }, { day: 'Sat', session: longS(70, 11) }, { day: 'Sun', session: REST }
    ]},
    { week: 10, phase: 'HM Training', goal: 'Pushing into new territory. Long runs building.', days: [
      { day: 'Mon', session: easyS(35) }, { day: 'Tue', session: easyS(30) },
      { day: 'Wed', session: intS(3, 1.5, 6) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(35) }, { day: 'Sat', session: longS(80, 13) }, { day: 'Sun', session: REST }
    ]},
    { week: 11, phase: 'HM Training', goal: 'Longest tempo yet. 20 minutes at hard effort.', days: [
      { day: 'Mon', session: easyS(40) }, { day: 'Tue', session: easyS(30) },
      { day: 'Wed', session: tempoS(40, 20) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(35) }, { day: 'Sat', session: longS(90, 14) }, { day: 'Sun', session: REST }
    ]},
    { week: 12, phase: 'HM Training', goal: 'Peak mileage approaching. Trust the process.', days: [
      { day: 'Mon', session: easyS(35) }, { day: 'Tue', session: easyS(30) },
      { day: 'Wed', session: intS(4, 1.5, 6) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(30) }, { day: 'Sat', session: longS(100, 16) }, { day: 'Sun', session: REST }
    ]},
    { week: 13, phase: 'HM Training', goal: 'Peak week. Your longest run ever. You are ready.', days: [
      { day: 'Mon', session: easyS(40) }, { day: 'Tue', session: easyS(35) },
      { day: 'Wed', session: tempoS(45, 25) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(35) }, { day: 'Sat', session: longS(110, 18) }, { day: 'Sun', session: REST }
    ]},
    { week: 14, phase: 'HM Training', goal: 'Recovery before taper. Absorb the fitness you built.', days: [
      { day: 'Mon', session: easyS(35) }, { day: 'Tue', session: easyS(30) },
      { day: 'Wed', session: easyS(35) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(30) }, { day: 'Sat', session: longS(90, 14) }, { day: 'Sun', session: REST }
    ]},
    { week: 15, phase: 'Taper', goal: 'Volume drops. Your body is becoming race-ready.', days: [
      { day: 'Mon', session: easyS(30) }, { day: 'Tue', session: easyS(25) },
      { day: 'Wed', session: tempoS(30, 10) }, { day: 'Thu', session: CROSS },
      { day: 'Fri', session: easyS(20) }, { day: 'Sat', session: longS(60, 9) }, { day: 'Sun', session: REST }
    ]},
    { week: 16, phase: 'Race Week', goal: 'Stay loose. Trust 16 weeks of work. You\'ve got this.', days: [
      { day: 'Mon', session: easyS(20) }, { day: 'Tue', session: easyS(15) },
      { day: 'Wed', session: easyS(15) }, { day: 'Thu', session: REST },
      { day: 'Fri', session: easyS(15) },
      { day: 'Sat', session: mk('race', '🏁 Race Day — Half Marathon!',
        'You trained for this. Start easy, find your rhythm, finish strong.',
        [WU(5), EASY(120), CD(10)], 135) },
      { day: 'Sun', session: REST }
    ]},
  ];

  readonly maintenanceWeek: WeekPlan = {
    week: '∞', phase: 'Maintenance',
    goal: 'Repeat weekly to keep your hard-earned fitness. You earned it.',
    days: [
      { day: 'Mon', session: easyS(40) }, { day: 'Tue', session: REST },
      { day: 'Wed', session: tempoS(40, 20) }, { day: 'Thu', session: easyS(30) },
      { day: 'Fri', session: CROSS }, { day: 'Sat', session: longS(90, 14) }, { day: 'Sun', session: REST }
    ]
  };

  get totalRunningSessions(): number {
    return this.plan.reduce((s, w) =>
      s + w.days.filter(d => d.session.type !== 'rest' && d.session.type !== 'cross').length, 0);
  }

  buildCustomSession(warmupM: number, runM: number, walkM: number, sets: number, cooldownM: number): Session {
    const intervals: Interval[] = [
      WU(warmupM),
      ...rwIntervals(runM, walkM, sets),
      CD(cooldownM)
    ];
    return {
      type: 'run-walk',
      name: `Custom: ${runM}min run / ${walkM}min walk × ${sets}`,
      desc: 'Your custom interval session.',
      intervals,
      duration: Math.round(intervals.reduce((s, i) => s + i.duration, 0) / 60)
    };
  }
}
