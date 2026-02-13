/* sigilweaver.js
   Sigil Weaver
   Vanilla JS, deterministic output, one weave per local day.

   Notes
   - The same input yields the same domain, text, and geometry.
   - A local date key avoids UTC drift.
   - Export waits for font readiness when available.
*/

const wordInput      = document.getElementById('wordInput');
const weaveBtn       = document.getElementById('weaveBtn');
const sigilCard      = document.getElementById('sigilCard');
const sigilContainer = document.getElementById('sigilContainer');
const sigilNameEl    = document.getElementById('sigilName');
const sigilIncantEl  = document.getElementById('sigilIncantation');
const downloadBtn    = document.getElementById('downloadBtn');

const STORAGE_KEY = 'sigil-weaver-last';

/* Local day key, not UTC */
function localYYYYMMDD(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function todayKey() {
  return localYYYYMMDD();
}

/* One per day gate */
if (localStorage.getItem(STORAGE_KEY) === todayKey()) {
  setWeavingDisabled(true);
}

function setWeavingDisabled(alreadyDone) {
  wordInput.disabled = true;
  weaveBtn.disabled = true;

  if (alreadyDone) {
    downloadBtn.classList.add('hidden');
    sigilCard.classList.remove('hidden');
    sigilIncantEl.textContent = 'The loom rests.';
  }
}

/* Domain map and phrase pools */
const domains = {
  protection: {
    names:  ['Ward of Quiet Iron','Circle of Ember Ash','Bind of Still Wind'],
    chants: ['Stand where harm dissolves.','Carry the edge of night as shield.','Let the sharp become soft in your wake.']
  },
  clarity: {
    names:  ['Lens of Early Light','Sigil of Bright Water','Glyph of Clear Voice'],
    chants: ['See without naming.','Let fog become form.','What is true arrives unmasked.']
  },
  release: {
    names:  ['Seal of Open Palm','Mark of Turning Tides','Key of Unfastened Days'],
    chants: ['Leave what is finished.','The tide takes and returns nothing alike.','Weight drifts when named aloud.']
  },
  journey: {
    names:  ['Compass of Quiet Roads','Waystone of Small Steps','Thread of Unseen Maps'],
    chants: ['Walk until the story shifts.','Every corner remembers you.','What you seek circles back.']
  },
  innerstillness: {
    names:  ['Knot of Settled Breath','Stone of Rested Waters','Glyph of Unspoken Quiet'],
    chants: ['Let motion settle beneath stillness.','There is power in staying quiet.','The deepest pools make no sound.']
  },
  intuition: {
    names:  ['Eye of Turning Leaves','Whisper Sigil','Glyph of the Unasked Answer'],
    chants: ['You already know.','The echo arrives before the sound.','Trust what comes without knocking.']
  },
  boundaries: {
    names:  ['Line of Soft Refusal','Mark of Kept Distance','Barrier of Kind Stone'],
    chants: ['What you protect protects you.','Edges are not always sharp.','Say no like a tree says no.']
  },
  grief: {
    names:  ['Sigil of the Weight Carried','Fragment Seal','Glyph of Hollow Holding'],
    chants: ['Let absence breathe beside you.','Not all things need mending.','You do not have to let go yet.']
  },
  transformation: {
    names:  ['Flame of the Fifth Hour','Sigil of Becoming','Cocoon Mark'],
    chants: ['What breaks may bloom.','Unfold even if it hurts.','The end is only the middle.']
  },
  longing: {
    names:  ['Vessel of Almost','Thread of Distant Fire','Mark of the Unreturned'],
    chants: ['Not everything comes home.','Desire carves its own echo.','Even empty hands remember.']
  },
  acceptance: {
    names:  ['Stone of What Is','Glyph of Open Palms','Seal of the Quiet Yes'],
    chants: ['Let it be without needing more.','Truth does not ask for your approval.','Breathe into what is here.']
  },
  connection: {
    names:  ['Thread of Shared Silence','Weave Mark','Circle of Mutual Light'],
    chants: ['We are stitched by attention.','Nothing spoken is ever fully lost.','The bond does not ask for proof.']
  },
  dreaming: {
    names:  ['Veil Sigil','Starwater Glyph','Loom of the Sleeping Eye'],
    chants: ['What you imagine waits for you.','Some doors open inward.','The dream carries its own compass.']
  },
  healing: {
    names:  ['Woundseal','Tend Mark','Glyph of Unrushed Repair'],
    chants: ['You do not need to be whole to begin.','Time does not rush the tree.','Every scar is a sentence closed.']
  },
  resilience: {
    names:  ['Core of Forged Shadow','Sigil of Staying','Root Mark'],
    chants: ['Stay even if it trembles.','Strength is quieter than fear.','Bend do not break.']
  },
  trust: {
    names:  ['Open Path Sigil','Circle of the First Step','Mark of Gentle Surrender'],
    chants: ['You will not know until you walk.','Not knowing is not failing.','Let the next moment meet you.']
  },
  forgiveness: {
    names:  ['Sigil of the Loosened Grip','Glyph of the Broken Chain','Ashlight Seal'],
    chants: ['Release what holds you by the throat.','You do not need their permission.','Forgiveness does not excuse, it frees.']
  },
  presence: {
    names:  ['Mark of the Next Breath','Sigil of Now','Anchor Glyph'],
    chants: ['Only this moment is yours.','Return to what is already here.','Be where your feet are.']
  },
  awe: {
    names:  ['Starleaf Sigil','Glyph of the First Light','Wondermark'],
    chants: ['Let your eyes be wide again.','Even the ordinary glows.','You are always beneath a sky.']
  },
  silence: {
    names:  ['Sigil of the Held Tongue','Glyph of Absent Sound','Seal of Echoless Rooms'],
    chants: ['Silence carries more than noise.','Listen to what is not said.','Let stillness finish your sentence.']
  },
  transition: {
    names:  ['Threshold Mark','Sigil of the Next Shape','Passage Glyph'],
    chants: ['Begin before you are ready.','Step without certainty.','No door opens unless approached.']
  },
  gratitude: {
    names:  ['Offering Stone','Sigil of the Given Light','Glyph of Small Thanks'],
    chants: ['What you notice grows.','Give thanks without reason.','Let appreciation become practice.']
  },
  selfcompassion: {
    names:  ['Mark of the Gentle Mirror','Sigil of Safe Return','Ember Touch Glyph'],
    chants: ['You are not a task to complete.','Speak to yourself like a child or a cat.','Kindness is not indulgence.']
  },
  mystery: {
    names:  ['Veilweaver Sigil','Glyph of the Unnamed','Shadowbind Mark'],
    chants: ['Not all things need knowing.','Wonder is a form of truth.','Let it remain strange.']
  }
};

const DOMAIN_KEYS = Object.keys(domains);

/* Synonyms, plus a few alias buckets that map into existing domains */
const synonyms = {
  innerstillness: ['still','quietude','settle','peace','hush','placid','serene','tranquil','restful'],
  intuition: ['know','gut','insight','sense','hunch','innervoice','instinct','feeling','nudge','whisper'],
  boundaries: ['limit','border','boundary','edge','fence','threshold','perimeter','line','frame','contain'],
  protection: ['safe','shield','guard','fortress','secure','defend','sanctuary','barrier','cover'],
  clarity: ['focus','light','clear','see','truth','vision','understand','lucid','reveal','discern'],
  release: ['letgo','release','surrender','unfasten','free','relieve','exhale','drop','unbind','yield'],
  journey: ['path','travel','move','step','walk','seek','explore','venture','roam','wander'],
  healing: ['heal','repair','rest','recover','soothe','tend','mend','balm','nurture','regrow'],
  grief: ['loss','grief','mourning','absence','ache','sorrow','emptiness','lament'],
  transformation: ['change','shift','grow','evolve','transform','become','emerge','molting','unfold','rebirth'],
  trust: ['trust','faith','believe','open','allow','lean','receive','follow','accept'],
  selfcompassion: ['kindness','gentle','soft','rest','mirror','tender','care','cradle','soothe'],
  awe: ['wonder','awe','beauty','glow','star','marvel','beyond','gaze','cosmic'],
  silence: ['quiet','still','silence','pause','listen','mute','hollow','echo','void','empty'],
  presence: ['now','here','awake','notice','breathe','anchor','aware','real','moment','attention'],
  resilience: ['endure','resist','strength','hold','weather','grit','persist','rise','sturdy','steady'],
  longing: ['yearn','reach','ache','desire','distance','pull','wish','dream','call'],
  transition: ['clock','drift','cycle','season','pass','wait','shift','tide','when'],
  gratitude: ['offer','give','serve','honour','ritual','practice','vow','tend','return'],
  mystery: ['unknown','mystery','strange','veil','unseen','hidden','shadow','obscure','arcane','enigmatic'],
  connection: ['home','gather','circle','kin','tribe','place','welcome','touch','shared','familiar'],
  dreaming: ['sleep','vision','float','drift','dream','unreal','phantom','image','fog','lull']
};

/* Seeded random, stable across sessions */
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }

  return () => {
    h = Math.imul(48271, h) | 0;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function makePicker(seed) {
  const r = seededRandom(seed);
  return arr => arr[Math.floor(r() * arr.length)];
}

/* Domain mapping
   Score by token hits against synonym lists.
   Fall back to a seeded pick if nothing matches.
*/
function domainFor(input) {
  const tokens = input
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const scored = DOMAIN_KEYS
    .map(k => {
      const syns = synonyms[k] || [];
      const score = tokens.reduce((acc, t) => acc + (syns.includes(t) ? 1 : 0), 0);
      return { k, score };
    })
    .sort((a, b) => b.score - a.score);

  if (scored[0].score > 0) return scored[0].k;

  const r = seededRandom(input)();
  return DOMAIN_KEYS[Math.floor(r * DOMAIN_KEYS.length)];
}

/* Domain tinted bronze, subtle drift per domain */
function domainStroke(dom) {
  const r1 = seededRandom(`hsl:${dom}`)();
  const r2 = seededRandom(`hsl2:${dom}`)();
  const r3 = seededRandom(`hsl3:${dom}`)();

  const h = 35 + Math.round((r1 - 0.5) * 8);
  const s = 38 + Math.round(r2 * 6);
  const l = 43 + Math.round((r3 - 0.5) * 10);
  return { h, s, l };
}

function strokeCss(col, alpha = 1) {
  return `hsl(${col.h} ${col.s}% ${col.l}% / ${alpha})`;
}

/* Organic per gesture rotation, tiny and correlated */
function organicGestureRotation(word, idx, y, center) {
  const r = seededRandom(`rot:${word}`);
  const base = (r() - 0.5) * 3.0;

  const amp1 = 2.2 + r() * 2.0;
  const amp2 = 0.8 + r() * 1.4;

  const freq1 = 0.35 + r() * 0.35;
  const freq2 = 0.15 + r() * 0.25;

  const phase1 = r() * Math.PI * 2;
  const phase2 = r() * Math.PI * 2;

  const jitter = (seededRandom(`rot:j:${word}:${idx}`)() - 0.5) * 0.6;

  let raw =
    base +
    amp1 * Math.sin(phase1 + idx * freq1) +
    amp2 * Math.sin(phase2 + idx * freq2) +
    jitter;

  const edgeWeight = Math.min(1, Math.abs(y - center) / (center * 0.9));
  raw *= (0.5 + 0.5 * edgeWeight);
  raw = Math.max(-8, Math.min(8, raw));

  return Math.round(raw * 2) / 2;
}

/* Build sigil SVG */
function generateSigilSVG(word, dom) {
  const size = 160;
  const center = size / 2;
  const radius = size * 0.365;
  const margin = 10;

  const col = domainStroke(dom);
  const chars = word.toLowerCase().replace(/[^a-z]/g, '').split('');
  const rand = seededRandom(`geom::${word}`);

  const rotation = rand() < 0.3 ? 0 : (chars.length * 9) % 360;

  const codes = chars.map(ch => ch.charCodeAt(0) - 96);
  const maxCode = codes.length ? Math.max(...codes) : 1;
  const maxIndex = codes.length ? codes.indexOf(maxCode) : 0;

  let innerPaths = '';
  let decorations = '';

  /* Anchor stroke is outside the inner rotation */
  const verticalLength = radius * (0.4 + (maxCode / 26) * 0.6);
  const vy1 = center - verticalLength;
  const vy2 = center + verticalLength;

  const anchorStroke = (1.6 + rand() * 1.2).toFixed(2);
  const anchorStroke2 = Math.max(0.8, anchorStroke - 0.6).toFixed(2);
  const tilt = Math.round(((rand() - 0.5) * 10) * 2) / 2;

  const bands = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75].map(v => center + v * (radius - margin));
  const usedYs = [];
  const minSpacing = 9;

  const horizontalChars = (chars.length ? chars : ['p','l','a','c','e'])
    .map((ch, i) => ({ ch, i }))
    .filter(({ i }) => i !== maxIndex)
    .slice(0, 5);

  horizontalChars.forEach(({ i }) => {
    const code = codes[i] || 13;

    const lineMaxLength = Math.sqrt(radius ** 2 - margin ** 2) * 2;
    const length = (0.4 + (code / 26) * 0.6) * lineMaxLength * 0.5;

    let y;
    let attempts = 0;
    do {
      y = bands[Math.floor(rand() * bands.length)];
      attempts++;
    } while (usedYs.some(prevY => Math.abs(prevY - y) < minSpacing) && attempts < 10);

    usedYs.push(y);

    const maxHalf = Math.sqrt(radius ** 2 - (y - center) ** 2);
    const halfLength = Math.min(length, maxHalf - margin);

    const x1 = center - halfLength;
    const x2 = center + halfLength;

    const strokeWidth = (1.6 + rand() * 1.2).toFixed(2);

    const rotDeg = organicGestureRotation(word, i, y, center);
    const pvx = center + (seededRandom(`rot:px:${word}:${i}`)() - 0.5) * 1.5;
    const pvy = center + (seededRandom(`rot:py:${word}:${i}`)() - 0.5) * 1.5;

    const wrapOpen = `<g transform="rotate(${rotDeg} ${pvx.toFixed(2)} ${pvy.toFixed(2)})">`;
    const wrapClose = `</g>`;

    const isBezier = rand() < 0.22;
    const filledChance = 0.18;

    if (isBezier) {
      const arcHeight = (rand() * 0.4 + 0.4) * 8;
      const arcDir = rand() < 0.5 ? 1 : -1;
      const cy = y + arcHeight * arcDir;

      if (rand() < filledChance) {
        const taperOffset = 2.0;
        innerPaths += `
          ${wrapOpen}
          <path d="M ${x1.toFixed(2)} ${y.toFixed(2)}
                   Q ${center.toFixed(2)} ${(cy - taperOffset).toFixed(2)} ${x2.toFixed(2)} ${y.toFixed(2)}
                   Q ${center.toFixed(2)} ${(cy + taperOffset).toFixed(2)} ${x1.toFixed(2)} ${y.toFixed(2)} Z"
               fill="${strokeCss(col, 0.78)}" opacity="0.9" />
          ${wrapClose}
        `;
      } else {
        innerPaths += `
          ${wrapOpen}
          <path d="M ${x1.toFixed(2)} ${y.toFixed(2)}
                   Q ${center.toFixed(2)} ${cy.toFixed(2)} ${x2.toFixed(2)} ${y.toFixed(2)}"
               stroke="${strokeCss(col, 0.95)}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" />
          ${wrapClose}
        `;
      }
    } else {
      if (rand() < 0.18) {
        const midX = (x1 + x2) / 2;
        const taperHeight = 2.0;
        innerPaths += `
          ${wrapOpen}
          <path d="M ${x1.toFixed(2)} ${y.toFixed(2)}
                   L ${midX.toFixed(2)} ${(y - taperHeight).toFixed(2)}
                   L ${x2.toFixed(2)} ${y.toFixed(2)}
                   L ${midX.toFixed(2)} ${(y + taperHeight).toFixed(2)} Z"
               fill="${strokeCss(col, 0.78)}" opacity="0.9" />
          ${wrapClose}
        `;
      } else {
        const midX = (x1 + x2) / 2;
        const micro = 0.9 * (1 + Math.abs(rotDeg) / 24);
        innerPaths += `
          ${wrapOpen}
          <path d="M ${x1.toFixed(2)} ${y.toFixed(2)}
                   L ${midX.toFixed(2)} ${(y - micro).toFixed(2)}
                   L ${x2.toFixed(2)} ${y.toFixed(2)}
                   L ${midX.toFixed(2)} ${(y + micro).toFixed(2)} Z"
               fill="${strokeCss(col, 0.85)}" opacity="0.9" />
          ${wrapClose}
        `;
      }
    }

    /* Endpoint dots, rare */
    [[x1, y], [x2, y]].forEach(([xx, yy]) => {
      if (rand() < 0.18) {
        const endpointDotRadius = 3.0;
        const isFilled = rand() < 0.55;
        const style = isFilled
          ? `fill="${strokeCss(col, 0.95)}" stroke="none"`
          : `fill="none" stroke="${strokeCss(col, 0.95)}" stroke-width="1.4"`;

        decorations += `
          ${wrapOpen}
          <circle cx="${xx.toFixed(2)}" cy="${yy.toFixed(2)}" r="${endpointDotRadius}" ${style} />
          ${wrapClose}
        `;
      }
    });
  });

  const rim = `
    <circle cx="${center}" cy="${center}" r="${radius + 6}"
      stroke="${strokeCss(col, 0.56)}" stroke-width="1.4" fill="none" />
    <circle cx="${center}" cy="${center}" r="${radius + 2}"
      stroke="${strokeCss(col, 0.22)}" stroke-width="0.6" fill="none" />
  `;

  const centerSeedR = (chars.length % 2 === 1) ? 3.2 : 2.6;
  decorations += `<circle cx="${center}" cy="${center}" r="${centerSeedR.toFixed(1)}" fill="${strokeCss(col, 0.95)}" />`;

  const rand2 = seededRandom(`geom::dot::${word}`);
  if (rand2() < 0.4) {
    const maxAttempts = 20;
    let dotX, dotY;
    let safe = false;

    for (let attempt = 0; attempt < maxAttempts && !safe; attempt++) {
      dotX = center + (rand2() - 0.5) * radius * 1.6;
      dotY = center + (rand2() - 0.5) * radius * 1.6;
      safe = bands.every(b => Math.abs(b - dotY) > 12);
    }

    if (safe) {
      const r = (1.8 + rand2()).toFixed(2);
      decorations += `<circle cx="${dotX.toFixed(2)}" cy="${dotY.toFixed(2)}" r="${r}" fill="${strokeCss(col)}" opacity="0.8" />`;
    }
  }

  const anchor = `
    <g transform="rotate(${tilt.toFixed(2)} ${center} ${center})">
      <line x1="${center}" y1="${vy1}" x2="${center}" y2="${vy2}"
        stroke="${strokeCss(col, 0.55)}" stroke-width="${anchorStroke}" stroke-linecap="round" />
      <line x1="${center}" y1="${vy1}" x2="${center}" y2="${vy2}"
        stroke="${strokeCss(col, 1)}" stroke-width="${anchorStroke2}" stroke-linecap="round" />
    </g>
  `;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      ${rim}
      ${anchor}
      <g transform="rotate(${rotation} ${center} ${center})">
        ${innerPaths}
        ${decorations}
      </g>
    </svg>
  `;
}

/* Deterministic text */
function craftText(word) {
  const dom = domainFor(word);
  const pick = makePicker(`${word}::${dom}::text`);
  return {
    dom,
    name: pick(domains[dom].names),
    incant: pick(domains[dom].chants)
  };
}

/* Weave */
weaveBtn.addEventListener('click', () => {
  const raw = wordInput.value.trim();
  if (!raw) return;

  const { dom, name, incant } = craftText(raw);

  sigilNameEl.textContent = name;
  sigilIncantEl.textContent = incant;

  sigilCard.classList.remove('hidden');
  sigilCard.classList.remove('fade-in');
  void sigilCard.offsetWidth;
  sigilCard.classList.add('fade-in');

  downloadBtn.classList.remove('hidden');

  sigilContainer.innerHTML = generateSigilSVG(raw, dom);

  const svgEl = sigilContainer.querySelector('svg');
  if (svgEl) {
    svgEl.setAttribute('role', 'img');
    svgEl.setAttribute('aria-label', `Sigil: ${name}`);
  }

  setWeavingDisabled(false);
  localStorage.setItem(STORAGE_KEY, todayKey());
});

/* Export PNG, crisp, font ready */
downloadBtn.addEventListener('click', async () => {
  const svgEl = sigilContainer.querySelector('svg');
  if (!svgEl) return;

  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch (e) {}
  }

  const svgData = new XMLSerializer().serializeToString(svgEl);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const canvas = document.createElement('canvas');
  const scale = Math.max(2, Math.floor(window.devicePixelRatio || 1));

  canvas.width = 480 * scale;

  const incantLines = Math.ceil(sigilIncantEl.textContent.length / 40);
  canvas.height = (320 + incantLines * 26 + 60) * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);

  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, (480 - 160) / 2, 80, 160, 160);

    ctx.fillStyle = '#c79c65';
    ctx.textAlign = 'center';

    ctx.font = '20px "Crimson Pro", serif';
    ctx.fillText(sigilNameEl.textContent, 240, 290);

    ctx.fillRect(120, 300, 240, 1);

    ctx.font = '16px "Crimson Pro", serif';
    wrapText(ctx, sigilIncantEl.textContent, 240, 330, 380, 22);

    const link = document.createElement('a');
    link.download = 'sigil-card.png';
    link.href = canvas.toDataURL('image/png');
    link.click();

    URL.revokeObjectURL(url);
    downloadBtn.classList.add('hidden');
  };

  img.src = url;
});

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, y);
      line = words[n] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line.trim(), x, y);
}

/* Daily reset when tab returns */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (localStorage.getItem(STORAGE_KEY) !== todayKey()) {
    location.reload();
  }
});
