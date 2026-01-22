"use client";

import * as React from "react";

type Meteor = {
  id: string;
  topVh: number;
  leftVw: number;
  angleDeg: number;
  durationMs: number;
  lengthPx: number;
  thicknessPx: number;
};

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randInt(min: number, max: number) {
  return Math.floor(rand(min, max + 1));
}

export function MeteorLayer({ enabled }: { enabled: boolean }) {
  const [mounted, setMounted] = React.useState(false);
  const [meteors, setMeteors] = React.useState<Meteor[]>([]);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    // Cleanup
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    if (!enabled) {
      setMeteors([]);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
      return;
    }

    let cancelled = false;

    const createMeteor = (): Meteor => {
      return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        // start further off-screen near the top-right, so从右上往左下划过
        topVh: rand(-12, 18),
        leftVw: rand(78, 120),
        // slight angle variation around ~-35deg (right-top -> left-bottom)
        angleDeg: -35 + rand(-6, 6),
        // slower: ~5.2s - 7.0s
        durationMs: randInt(5200, 7000),
        // dreamy long tail
        lengthPx: randInt(360, 640),
        thicknessPx: rand(1.8, 3.1),
      };
    };

    const spawnBurst = () => {
      if (cancelled) return;
      const count = randInt(3, 6); // meteor群，一次 3~6 颗
      const baseDelay = 0;
      const localMeteors: Meteor[] = [];

      for (let i = 0; i < count; i++) {
        const m = createMeteor();
        // 每颗流星在群里稍微错开一点时间
        const delay = baseDelay + i * randInt(280, 520);
        window.setTimeout(() => {
          if (cancelled) return;
          setMeteors((prev) => [...prev, m]);
          // 清理单颗
          window.setTimeout(() => {
            if (cancelled) return;
            setMeteors((prev) => prev.filter((x) => x.id !== m.id));
          }, m.durationMs + 250);
        }, delay);
        localMeteors.push(m);
      }
    };

    const scheduleNext = () => {
      if (cancelled) return;
      // meteor shower style: 一阵流星群 -> 间隔一段时间
      const delay = randInt(9000, 18000); // 9s ~ 18s 之间来一阵
      timerRef.current = window.setTimeout(() => {
        if (cancelled) return;
        spawnBurst();
      }, delay);
    };

    // First burst quickly so users可以马上看到效果
    timerRef.current = window.setTimeout(() => {
      if (cancelled) return;
      spawnBurst();
    }, 500);

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [enabled, mounted]);

  if (!mounted || !enabled || meteors.length === 0) return null;

  return (
    <div className="meteor-layer" aria-hidden="true">
      {meteors.map((meteor) => (
        <div
          key={meteor.id}
          className="meteor-dreamy"
          style={
            {
              top: `${meteor.topVh}vh`,
              left: `${meteor.leftVw}vw`,
              ["--meteor-angle" as any]: `${meteor.angleDeg}deg`,
              ["--meteor-duration" as any]: `${meteor.durationMs}ms`,
              ["--meteor-length" as any]: `${meteor.lengthPx}px`,
              ["--meteor-thickness" as any]: `${meteor.thicknessPx}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

