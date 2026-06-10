const TOTAL = 3600; //3600
let elapsed = 0;
let running = false;
let started = false;
let mainInterval = null;
let totalInt = 0;

const SOUNDS = [
  { id:'amongus',   name:'among us',       emoji:'imposter.gif', file:'amongus.mp3',    min:30, max:160 },
  { id:'bruh',      name:'bruh',           emoji:'rock.gif', file:'bruh.mp3',       min:20, max:120 },
  { id:'faa',       name:'FAAA',           emoji:'faaa.gif', file:'FAAA.mp3',       min:25, max:150 },
  { id:'fart',      name:'fart',           emoji:'fart.gif', file:'fart.mp3',       min:15, max:80  },
  { id:'lego',      name:'lego',           emoji:'broken.gif', file:'lego.mp3',       min:20, max:100 },
  { id:'pipe',      name:'metal pipe',     emoji:'pipe.gif', file:'metalpipe.mp3',  min:20, max:120 },
  { id:'oof',       name:'oof',            emoji:'hurt.gif', file:'oof.mp3',        min:15, max:90  },
  { id:'quack',     name:'quack',          emoji:'duck.gif', file:'quack.mp3',      min:20, max:100 },
  { id:'reverb',    name:'reverb',         emoji:'fart.gif', file:'reverb.mp3',     min:30, max:180 },
  { id:'villager',  name:'villager',       emoji:'hmmm.gif', file:'villager.mp3',  min:25, max:140 },
  { id:'vine',      name:'vine boom',      emoji:'rock.gif', file:'vine.mp3',       min:25, max:150 },
  { id:'wrong',     name:'wrong',          emoji:'lie.gif', file:'wrong.mp3',      min:30, max:160 },
];

function playSound(file) {
  const audio = new Audio(`media/${file}`);
  audio.volume = 1.0;
  audio.play().catch(() => {});
}

const activeTimers = {};
const soundStates = {};

function scheduleNext(id) {
  const s = SOUNDS.find(x => x.id === id);
  if (!s || !soundStates[id] || !running) return;
  const delay = s.min + Math.random() * (s.max - s.min);
  activeTimers[id] = setTimeout(() => {
    if (soundStates[id] && running) {
      fire(id);
      scheduleNext(id);
    }
  }, delay * 1000);
}

function clearSoundTimer(id) {
  if (activeTimers[id]) { clearTimeout(activeTimers[id]); delete activeTimers[id]; }
}

function fire(id) {
  const s = SOUNDS.find(x => x.id === id);
  if (!s) return;
  playSound(s.file);
  spawnFloatingEmoji(s.emoji);
  addLog(s.name, s.emoji);
}

function spawnFloatingEmoji(emoji) {
  const scene = document.getElementById('scene');
  const w = scene.offsetWidth;
  const h = scene.offsetHeight;
  const el = document.createElement('img');
  el.className = 'scene-emoji-float';
  el.src = 'media/' + emoji;
  const margin = 70;
  el.style.left = (margin + Math.random() * (w - margin * 2)) + 'px';
  el.style.top  = (margin + Math.random() * (h - margin * 2)) + 'px';
  scene.appendChild(el);
  requestAnimationFrame(() => {
    el.classList.add('visible');
    setTimeout(() => {
      el.classList.add('fading');
      setTimeout(() => el.remove(), 1000);
    }, 1000);
  });
}

function addLog(name, emoji) {
  const log = document.getElementById('log-entries');
  const el = document.createElement('div');
  totalInt++;
  el.className = 'log-entry';
  el.innerHTML = `<span class="log-time">${formatTime(elapsed)}</span><span>${name}</span>`;
  log.prepend(el);
  if (log.children.length > 12) log.removeChild(log.lastChild);
}

function formatTime(s) {
  const rem = Math.max(0, TOTAL - s);
  const h = Math.floor(rem / 3600);
  const m = Math.floor((rem % 3600) / 60);
  const sec = rem % 60;
  return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function updateDisplay() {
  document.getElementById('timer-display').textContent = formatTime(elapsed);
  document.getElementById('progress-fill').style.width = ((elapsed / TOTAL) * 100) + '%';
  
  if (document.getElementById('progress-fill').style.width == '100%') {
	timerOver(totalInt);
  }
}

function timerOver(totalInt) {
    const end = document.getElementById('ending-grid');
    end.innerHTML = '';

    const endDiv = document.createElement('div');
    endDiv.className = 'ending-screen';

    endDiv.innerHTML = `
        <h1>Session Ended</h1>
        <p>You were interrupted ${totalInt} times.</p>
        <button class="reset-btn" onclick="removeEnding()">Reset</button>
    `;

    end.appendChild(endDiv);
}

function startTimer() {
  started = true;
  running = true;
  document.getElementById('btn-play').textContent = 'Pause';
  document.getElementById('timer-display').classList.add('ticking');
  mainInterval = setInterval(() => {
    elapsed++;
    updateDisplay();
    if (elapsed >= TOTAL) resetTimer();
  }, 1000);
  SOUNDS.forEach(s => { if (soundStates[s.id] && !activeTimers[s.id]) scheduleNext(s.id); });
}

function togglePlay() {
  if (!started) { startTimer(); return; }
  if (running) {
    running = false;
    clearInterval(mainInterval); mainInterval = null;
    document.getElementById('btn-play').textContent = 'Play';
    document.getElementById('timer-display').classList.remove('ticking');
    SOUNDS.forEach(s => clearSoundTimer(s.id));
  } else {
    running = true;
    document.getElementById('btn-play').textContent = 'Pause';
    document.getElementById('timer-display').classList.add('ticking');
    mainInterval = setInterval(() => {
      elapsed++;
      updateDisplay();
      if (elapsed >= TOTAL) resetTimer();
    }, 1000);
    SOUNDS.forEach(s => { if (soundStates[s.id]) scheduleNext(s.id); });
  }
}

function toggleOnOff(checked) {
	const master = document.activeElement;
	document.querySelectorAll('.pill-toggle input[type="checkbox"]').forEach(cb => {
	    if (cb !== master) {
	        cb.checked = checked;
	        cb.dispatchEvent(new Event('change'));
	    }
	});
}

function removeEnding() {
	const end = document.getElementById('ending-grid');
	end.innerHTML = '';
	startTimer()
}

function resetTimer() {
  totalInt = 0;
  running = false; started = false;
  clearInterval(mainInterval); mainInterval = null;
  elapsed = 0;
  SOUNDS.forEach(s => clearSoundTimer(s.id));
  updateDisplay();
  document.getElementById('btn-play').textContent = 'Play';
  document.getElementById('timer-display').classList.remove('ticking');
}

function toggleSound(id, checked) {
  soundStates[id] = checked;
  const card = document.querySelector(`[data-id="${id}"]`);
  if (card) card.classList.toggle('active', checked);

  if (checked) {
    const s = SOUNDS.find(x => x.id === id);
    playSound(s.file);
    spawnFloatingEmoji(s.emoji);
    if (!started) startTimer();
    else if (running && !activeTimers[id]) scheduleNext(id);
  } else {
    clearSoundTimer(id);
  }
}


function buildGrid() {
  const grid = document.getElementById('sounds-grid');
  SOUNDS.forEach(s => {
    const pill = document.createElement('div');
    pill.className = 'sound-pill';
    pill.dataset.id = s.id;
    pill.innerHTML = `
      <span class="pill-name">${s.name}</span>
      <label class="pill-toggle" title="arm ${s.name}">
        <input type="checkbox" onchange="toggleSound('${s.id}', this.checked)">
        <div class="tog-track"></div>
      </label>
    `;
    grid.appendChild(pill);
  });
}

buildGrid();
updateDisplay();