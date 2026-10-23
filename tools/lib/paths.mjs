// 窮舉一個角色所有的選擇路徑
// 規則與遊戲引擎（frontend/js/game.js）相同：每天早上 +OVERNIGHT、能量限制在 0–100、
// 能量低於 need 的選項會被劃掉、if 只在旗標成立時展開
//
// 每條路徑記錄：選了什麼、旗標、看到的每一句話、每個選擇點的能量與被劃掉的選項

export function clamp(n) {
  return Math.max(0, Math.min(100, n));
}

export function enumeratePaths(story, { start, overnight }) {
  const paths = [];
  const list = [...story.story, { k: 'ending' }];

  // 把一串步驟展開到目前的狀態上；遇到選擇就分岔
  function walk(queue, s) {
    while (queue.length) {
      const step = queue.shift();
      if (step.k === 'day') {
        if (s.day) s.energy = clamp(s.energy + overnight);
        s.day = step.day;
        s.energyLog.push({ day: step.day, energy: s.energy });
        continue;
      }
      if (step.k === 'if') {
        // 標記為「依旗標出現」的內容，測試用來區分固定劇情與細節
        if (s.flags[step.flag]) queue.unshift(...step.then.map((t) => ({ ...t, conditional: true })));
        continue;
      }
      if (step.k === 'ending') {
        queue.unshift(...story.ending);
        s.inEnding = true;
        continue;
      }
      if (step.k === 'choice') {
        const options = step.options.map((o) => ({ option: o, locked: (o.need || 0) > s.energy }));
        const point = { day: s.day, prompt: step.prompt, energy: s.energy, locked: options.map((x) => x.locked) };
        options.forEach(({ option, locked }, n) => {
          if (locked) return;
          const next = fork(s);
          next.choices.push({ ...point, picked: n });
          if (option.flag) next.flags[option.flag] = true;
          applyEffect(next, option.effect);
          walk([...option.then, ...queue], next);
        });
        if (options.every((x) => x.locked)) {
          s.deadEnds.push(point);
          paths.push(s);
        }
        return;
      }
      applyEffect(s, step.effect);
      s.lines.push({
        speaker: step.speaker, text: step.text, inner: step.inner,
        ending: !!s.inEnding, conditional: !!step.conditional,
      });
    }
    paths.push(s);
  }

  walk([...list], {
    energy: start, day: null, flags: {}, choices: [], lines: [], energyLog: [],
    witness: 0, kind: 0, energyRange: [start, start], deadEnds: [], inEnding: false,
  });
  return paths;
}

function fork(s) {
  return {
    ...s,
    flags: { ...s.flags },
    choices: [...s.choices],
    lines: [...s.lines],
    energyLog: [...s.energyLog],
    energyRange: [...s.energyRange],
    deadEnds: [...s.deadEnds],
  };
}

function applyEffect(s, effect) {
  if (!effect) return;
  s.witness += effect.witness || 0;
  s.kind += effect.kind || 0;
  if (effect.courage) {
    const raw = s.energy + effect.courage;
    s.energyRange = [Math.min(s.energyRange[0], raw), Math.max(s.energyRange[1], raw)];
    s.energy = clamp(raw);
  }
}

// 每個選擇點、每個選項，在多少比例的到達路徑中被劃掉
export function lockRates(paths) {
  const rates = new Map();
  for (const p of paths) {
    for (const c of p.choices) {
      const key = `${c.day}｜${c.prompt}`;
      const r = rates.get(key) || { day: c.day, prompt: c.prompt, reached: 0, locked: c.locked.map(() => 0) };
      r.reached += 1;
      c.locked.forEach((l, i) => { if (l) r.locked[i] += 1; });
      rates.set(key, r);
    }
  }
  return [...rates.values()];
}
