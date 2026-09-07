// =========================================================
// WEPAN - سیستم صدا (نسخه نهایی)
// =========================================================

console.log('WEPAN loading with sound...');

// ===== سیستم صدا =====
let audioCtx = null;
let soundEnabled = true;

// فرکانس نت‌ها (هرتز) - دقیقاً مطابق نت‌های هنگ‌درام
const NOTE_FREQS = {
    'C': 261.63,
    'D': 293.66,
    'E': 329.63,
    'F': 349.23,
    'G': 392.00,
    'A': 440.00,
    'Bb': 466.16,
    'A_high': 880.00,
    'D_high': 587.33
};

// راه‌اندازی AudioContext (باید با کلیک کاربر فعال بشه)
function initAudio() {
    if (!audioCtx) {
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✅ AudioContext created!');
        } catch (e) {
            console.log('❌ AudioContext error:', e);
        }
    }
    // Resume if suspended
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

// ===== پخش صدای نت (با کیفیت بهتر) =====
function playHandpanNote(noteName, duration = 0.6, volume = 0.35) {
    if (!soundEnabled) return;
    
    try {
        // راه‌اندازی AudioContext
        const ctx = initAudio();
        if (!ctx) return;
        
        const freq = NOTE_FREQS[noteName];
        if (!freq) return;
        
        const now = ctx.currentTime;
        
        // ===== نوسان‌ساز اصلی (سینوسی با پوشش نرم) =====
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        // پوشش ADSR برای صدای طبیعی هنگ‌درام
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(volume * 0.8, now + 0.005);
        gain.gain.linearRampToValueAtTime(volume, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(volume * 0.7, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration + 0.1);
        
        // ===== هارمونیک دوم (برای غنای صدا) =====
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2.0, now);
        
        gain2.gain.setValueAtTime(0, now);
        gain2.gain.linearRampToValueAtTime(volume * 0.08, now + 0.01);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.8);
        
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        
        osc2.start(now);
        osc2.stop(now + duration + 0.1);
        
        // ===== هارمونیک سوم (برای صدای فلزی) =====
        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(freq * 3.0, now);
        
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.linearRampToValueAtTime(volume * 0.03, now + 0.02);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.5);
        
        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        
        osc3.start(now);
        osc3.stop(now + duration + 0.1);
        
        // ===== افکت ریورب ساده (با تأخیر) =====
        const delay = ctx.createDelay(0.3);
        const delayGain = ctx.createGain();
        delay.delayTime.value = 0.15;
        delayGain.gain.value = 0.12;
        
        gain.connect(delay);
        delay.connect(delayGain);
        delayGain.connect(ctx.destination);
        
        // ===== صدای ضربه (ضربه انگشت روی هنگ‌درام) =====
        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.015, ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) {
            noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.3));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(volume * 0.12, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.04);
        
    } catch (e) {
        console.log('Sound error:', e);
    }
}

// ===== پخش صدای Miss =====
function playMissSound() {
    if (!soundEnabled) return;
    try {
        const ctx = initAudio();
        if (!ctx) return;
        
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    } catch (e) {}
}

// ===== پخش صدای COMBO =====
function playComboSound(combo) {
    if (!soundEnabled) return;
    try {
        const ctx = initAudio();
        if (!ctx) return;
        
        const now = ctx.currentTime;
        const freq = 440 + Math.min(combo, 20) * 15;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    } catch (e) {}
}

// ===== تست صدا (برای دیباگ) =====
function testSound() {
    console.log('Testing sound...');
    initAudio();
    if (audioCtx && audioCtx.state === 'running') {
        playHandpanNote('C', 0.5, 0.3);
        setTimeout(() => playHandpanNote('E', 0.5, 0.3), 300);
        setTimeout(() => playHandpanNote('G', 0.5, 0.3), 600);
        console.log('✅ Sound test played!');
    } else {
        console.log('❌ AudioContext not running. State:', audioCtx ? audioCtx.state : 'null');
        // تلاش برای راه‌اندازی مجدد
        if (audioCtx) {
            audioCtx.resume().then(() => {
                console.log('✅ AudioContext resumed!');
                testSound();
            });
        }
    }
}

// ===== قطع/وصل صدا =====
function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundToggle');
    btn.textContent = soundEnabled ? '🔊' : '🔇';
    btn.classList.toggle('active', soundEnabled);
    console.log('Sound:', soundEnabled ? 'ON' : 'OFF');
}

// =========================================================
// بقیه کدهای بازی (با اصلاحات صدا)
// =========================================================

// ===== LESSONS =====
const LESSONS = [
    { id: 1, title: 'نت C', desc: 'ضربه روی نت C', level: 1 },
    { id: 2, title: 'نت D', desc: 'ضربه روی نت D', level: 1 },
    { id: 3, title: 'نت E', desc: 'ضربه روی نت E', level: 1 },
    { id: 4, title: 'C و D', desc: 'C سپس D', level: 2 },
    { id: 5, title: 'D و E', desc: 'D سپس E', level: 2 },
    { id: 6, title: 'سه نت', desc: 'C-D-E', level: 3 },
];

// ===== DATA =====
const NOTE_X = { "A_high":75, "F":170, "G":265, "E":355, "D":430, "D_high":500, "C":595, "Bb":690, "A":760 };
const NOTE_COLORS = { "C":"#38bdf8", "D":"#60a5fa", "E":"#2dd4bf", "F":"#818cf8", "G":"#a78bfa", "A":"#f472b6", "Bb":"#fbbf24", "A_high":"#fb7185", "D_high":"#34d399" };
const NOTE_LABELS = { "A":"A", "Bb":"Bb", "C":"C", "D_high":"D", "E":"E", "F":"F", "G":"G", "A_high":"A", "D":"D" };
const ALL_NOTES = Object.keys(NOTE_X);
const TOTAL_NOTES = 20;

// ===== STATE =====
let currentLesson = null;
let score = 0, hits = 0, misses = 0, combo = 0, bestCombo = 0, notesPlayed = 0;
let isPaused = false, gameRunning = false, isGameReady = false;
let speedMultiplier = 1.0;
let fallingNote = null, currentTarget = null, noteY = 20, hitY = 220;
let animationId = null, lastTime = 0;
let timerInterval = null;
let canvas, ctx, panCanvas, panCtx;
let isGameInitialized = false;
let GAME_SPEED = 200;
let DROPLET_SCALE = 0.65;
let mainColor = '#38bdf8';

// ===== STATS =====
let completed = JSON.parse(localStorage.getItem('wepan_completed') || '[]');
let streak = parseInt(localStorage.getItem('wepan_streak') || '0');

// ===== FUNCTIONS (با صدا) =====
function showLessons() {
    // راه‌اندازی صدا با کلیک کاربر
    initAudio();
    document.getElementById('welcomePage').style.display = 'none';
    document.getElementById('lessonsPage').style.display = 'block';
    document.getElementById('gamePage').style.display = 'none';
    document.getElementById('resultPage').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'none';
    renderLessons();
}

function showSettings() {
    initAudio();
    document.getElementById('welcomePage').style.display = 'none';
    document.getElementById('lessonsPage').style.display = 'none';
    document.getElementById('gamePage').style.display = 'none';
    document.getElementById('resultPage').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'block';
    document.getElementById('speedRange').value = GAME_SPEED;
    document.getElementById('speedValueDisplay').textContent = GAME_SPEED;
    document.getElementById('dropSizeRange').value = DROPLET_SCALE;
    document.getElementById('dropSizeValueDisplay').textContent = DROPLET_SCALE;
}

function goHome() {
    document.getElementById('welcomePage').style.display = 'flex';
    document.getElementById('lessonsPage').style.display = 'none';
    document.getElementById('gamePage').style.display = 'none';
    document.getElementById('resultPage').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'none';
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    gameRunning = false;
    isGameReady = false;
    document.getElementById('timerOverlay').style.display = 'none';
    updateWelcomeStats();
}

function backToLessons() {
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    gameRunning = false;
    isGameReady = false;
    document.getElementById('gamePage').style.display = 'none';
    document.getElementById('resultPage').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'none';
    document.getElementById('lessonsPage').style.display = 'block';
    document.getElementById('timerOverlay').style.display = 'none';
    renderLessons();
}

function renderLessons() {
    const container = document.getElementById('lessonsContainer');
    container.innerHTML = LESSONS.map((l, i) => {
        const done = completed.includes(String(l.id));
        const locked = i > 0 && !completed.includes(String(LESSONS[i-1].id));
        return `
            <div class="lesson-card ${locked ? 'locked' : ''} ${done ? 'completed' : ''}" 
                 onclick="${locked ? '' : `startLesson(${l.id})`}">
                <div class="info">
                    <h3>${l.title}</h3>
                    <p>${l.desc}</p>
                    <span class="level-tag">سطح ${l.level}</span>
                    ${done ? `<span style="color:#2dd4bf;font-size:12px;margin-right:8px;">✅ انجام شده</span>` : ''}
                </div>
                <div class="status">${done ? '✅' : locked ? '🔒' : '▶️'}</div>
            </div>
        `;
    }).join('');
    updateWelcomeStats();
}

function updateWelcomeStats() {
    document.getElementById('wTotal').textContent = LESSONS.length;
    document.getElementById('wDone').textContent = completed.length;
    document.getElementById('wStreak').textContent = streak;
}

function updateSpeedSetting(val) {
    GAME_SPEED = parseInt(val);
    document.getElementById('speedValueDisplay').textContent = val;
}

function updateDropSize(val) {
    DROPLET_SCALE = parseFloat(val);
    document.getElementById('dropSizeValueDisplay').textContent = val;
}

function setLanguage(lang, btn) {
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

function setColor(color, btn) {
    mainColor = color;
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    document.querySelectorAll('.header h1').forEach(el => {
        el.style.background = `linear-gradient(135deg, ${color}, ${color}cc)`;
        el.style.webkitBackgroundClip = 'text';
        el.style.webkitTextFillColor = 'transparent';
    });
}

function startTimer(callback) {
    let count = 3;
    const overlay = document.getElementById('timerOverlay');
    const number = document.getElementById('timerNumber');
    overlay.style.display = 'flex';
    number.textContent = count;
    number.style.animation = 'none';
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        count--;
        if (count === 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            overlay.style.display = 'none';
            if (callback) callback();
            return;
        }
        number.textContent = count;
        number.style.animation = 'none';
        setTimeout(() => { number.style.animation = 'timerPulse 0.8s ease-in-out'; }, 10);
    }, 1000);
}

function startLesson(lessonId) {
    currentLesson = LESSONS.find(l => l.id === lessonId);
    if (!currentLesson) return;
    
    // 🔊 راه‌اندازی صدا با کلیک کاربر
    initAudio();
    
    // تست صدا (برای اطمینان)
    setTimeout(() => {
        if (soundEnabled && audioCtx && audioCtx.state === 'running') {
            playHandpanNote('C', 0.3, 0.2);
        }
    }, 100);
    
    document.getElementById('lessonsPage').style.display = 'none';
    document.getElementById('gamePage').style.display = 'block';
    document.getElementById('resultPage').style.display = 'none';
    document.getElementById('settingsPage').style.display = 'none';
    document.getElementById('gameTitle').textContent = `🥁 ${currentLesson.title}`;
    
    if (!isGameInitialized) {
        setupCanvases();
        isGameInitialized = true;
    }
    
    resetGame();
    drawHandpan();
    drawFallingArea();
    
    isGameReady = false;
    startTimer(() => {
        isGameReady = true;
        gameRunning = true;
        spawnNote();
    });
}

function resetGame() {
    score = 0; hits = 0; misses = 0; combo = 0; bestCombo = 0; notesPlayed = 0;
    isPaused = false; fallingNote = null; currentTarget = null; lastTime = 0;
    isGameReady = false; gameRunning = false;
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    document.getElementById('timerOverlay').style.display = 'none';
    document.getElementById('pauseButton').textContent = '⏸ PAUSE';
    document.getElementById('scoreDisplay').textContent = 'SCORE 0';
    document.getElementById('comboDisplay').textContent = 'COMBO 0';
    document.getElementById('accuracyDisplay').textContent = 'ACC 0%';
    document.getElementById('progressLabel').textContent = 'NOTES 0 / 20';
    document.getElementById('targetNote').textContent = '—';
    document.getElementById('targetNote').style.color = '#94a3b8';
}

function setupCanvases() {
    canvas = document.getElementById('fallingCanvas');
    ctx = canvas.getContext('2d');
    panCanvas = document.getElementById('handpanCanvas');
    panCtx = panCanvas.getContext('2d');
    const resize = () => {
        const w = Math.min(820, canvas.parentElement.clientWidth - 10);
        canvas.style.width = w + 'px';
        canvas.style.height = (w * 280 / 820) + 'px';
        panCanvas.style.width = w + 'px';
        panCanvas.style.height = (w * 280 / 820) + 'px';
    };
    resize();
    window.addEventListener('resize', resize);
}

function drawFallingArea() {
    const W=820, H=280;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#475569'; ctx.font='bold 8px Arial'; ctx.fillText('EVEN',180,27);
    ctx.fillStyle='#60a5fa'; ctx.fillText('D • CENTER',430,27);
    ctx.fillStyle='#475569'; ctx.fillText('ODD',660,27);
    ctx.strokeStyle='#1b2b3d'; ctx.lineWidth=1;
    for(let x of Object.values(NOTE_X)) { ctx.beginPath(); ctx.moveTo(x,42); ctx.lineTo(x,232); ctx.stroke(); }
    ctx.strokeStyle='#315270'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.moveTo(NOTE_X['D'],38); ctx.lineTo(NOTE_X['D'],242); ctx.stroke();
    hitY = 220;
    ctx.strokeStyle=mainColor; ctx.lineWidth=4;
    ctx.beginPath(); ctx.moveTo(18,hitY); ctx.lineTo(W-18,hitY); ctx.stroke();
    ctx.strokeStyle='#67e8f9'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.moveTo(18,hitY); ctx.lineTo(W-18,hitY); ctx.stroke();
    const nums = [[8,"A_high"],[6,"F"],[7,"G"],[5,"E"],[4,"D_high"],[3,"C"],[2,"Bb"],[1,"A"]];
    ctx.font='bold 9px Arial';
    for(let [n,note] of nums) {
        let x=NOTE_X[note];
        ctx.fillStyle='#94a3b8'; ctx.fillText(n,x-6,hitY-18);
        ctx.fillStyle=NOTE_COLORS[note]; ctx.font='bold 7px Arial';
        ctx.fillText(NOTE_LABELS[note],x-5,hitY+15);
        ctx.font='bold 9px Arial';
    }
    ctx.fillStyle='#60a5fa'; ctx.font='bold 10px Arial';
    ctx.fillText('D',NOTE_X['D']-7,hitY-20);
    ctx.fillStyle=NOTE_COLORS['D']; ctx.font='bold 7px Arial';
    ctx.fillText('D',NOTE_X['D']-3,hitY+15);
    ctx.fillStyle='#67e8f9'; ctx.font='bold 8px Arial';
    ctx.fillText('HIT',W-43,hitY-36);
}

function drawHandpan(highlight=null) {
    const W=820, H=280;
    panCtx.clearRect(0,0,W,H);
    panCtx.strokeStyle='#18273a'; panCtx.lineWidth=2; panCtx.strokeRect(10,10,800,260);
    panCtx.fillStyle='#475569'; panCtx.font='bold 9px Arial'; panCtx.fillText('HANDPAN',38,27);
    const cx=430, cy=150, r=115;
    panCtx.shadowColor='#040810'; panCtx.shadowBlur=20;
    panCtx.beginPath(); panCtx.arc(cx,cy,r,0,Math.PI*2);
    panCtx.fillStyle='#293646'; panCtx.fill();
    panCtx.shadowBlur=0;
    panCtx.strokeStyle='#64748b'; panCtx.lineWidth=3; panCtx.stroke();
    panCtx.beginPath(); panCtx.arc(cx,cy,r-8,0,Math.PI*2);
    panCtx.fillStyle='#263342'; panCtx.fill();
    panCtx.strokeStyle='#3f4e61'; panCtx.lineWidth=2; panCtx.stroke();
    const pos = { "A":[430,55,20], "Bb":[510,85,20], "C":[545,145,20], "D_high":[510,205,20], "E":[430,235,20], "F":[350,205,20], "G":[315,145,20], "A_high":[350,85,20], "D":[430,145,34] };
    for(let [note,[x,y,r2]] of Object.entries(pos)) {
        let col = NOTE_COLORS[note], hl = highlight===note;
        panCtx.shadowColor='#111923'; panCtx.shadowBlur=10;
        panCtx.beginPath(); panCtx.arc(x,y,r2+2,0,Math.PI*2);
        panCtx.fillStyle='#111923'; panCtx.fill();
        panCtx.shadowBlur=0;
        panCtx.beginPath(); panCtx.arc(x,y,r2,0,Math.PI*2);
        panCtx.fillStyle=hl?'#1a3a5a':'#1d2835';
        panCtx.fill();
        panCtx.strokeStyle=hl?col:'#4a596d';
        panCtx.lineWidth=hl?3:2;
        panCtx.stroke();
        panCtx.beginPath(); panCtx.arc(x,y,r2-4,0,Math.PI*2);
        panCtx.strokeStyle=col; panCtx.lineWidth=1; panCtx.stroke();
        panCtx.fillStyle=hl?col:'#e5e7eb';
        panCtx.font=`bold ${note==='D'?13:10}px Arial`;
        panCtx.textAlign='center'; panCtx.textBaseline='middle';
        panCtx.fillText(NOTE_LABELS[note],x,y);
    }
}

function drawDroplet(x,y,note) {
    let col = NOTE_COLORS[note];
    const s = DROPLET_SCALE;
    ctx.fillStyle=col; ctx.globalAlpha=0.25;
    ctx.beginPath();
    ctx.moveTo(x-2*s,y-25*s);
    ctx.quadraticCurveTo(x-6*s,y-45*s,x-4*s,y-58*s);
    ctx.quadraticCurveTo(x,y-65*s,x+4*s,y-58*s);
    ctx.quadraticCurveTo(x+6*s,y-45*s,x+2*s,y-25*s);
    ctx.fill();
    ctx.globalAlpha=1;
    ctx.shadowColor=col; ctx.shadowBlur=12;
    ctx.beginPath();
    ctx.moveTo(x,y-36*s);
    ctx.quadraticCurveTo(x+24*s,y-8*s,x+26*s,y+12*s);
    ctx.quadraticCurveTo(x+24*s,y+32*s,x,y+43*s);
    ctx.quadraticCurveTo(x-24*s,y+32*s,x-26*s,y+12*s);
    ctx.quadraticCurveTo(x-24*s,y-8*s,x,y-36*s);
    ctx.fillStyle=col; ctx.fill();
    ctx.shadowBlur=0;
    ctx.strokeStyle='#fff'; ctx.lineWidth=0.8; ctx.stroke();
    ctx.globalAlpha=0.4;
    ctx.beginPath();
    ctx.moveTo(x,y-16*s);
    ctx.quadraticCurveTo(x+12*s,y-4*s,x+11*s,y+8*s);
    ctx.quadraticCurveTo(x+8*s,y+20*s,x,y+22*s);
    ctx.quadraticCurveTo(x-8*s,y+20*s,x-11*s,y+8*s);
    ctx.quadraticCurveTo(x-12*s,y-4*s,x,y-16*s);
    ctx.fillStyle='#fff'; ctx.fill();
    ctx.globalAlpha=1;
    ctx.fillStyle='#06121c'; ctx.font='bold 7px Arial';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(NOTE_LABELS[note],x,y+5*s);
}

function spawnNote() {
    if (!gameRunning || !isGameReady) return;
    if (notesPlayed >= TOTAL_NOTES) { finishGame(); return; }
    let note = ALL_NOTES[Math.floor(Math.random()*ALL_NOTES.length)];
    currentTarget = note;
    noteY = 18;
    document.getElementById('targetNote').textContent = NOTE_LABELS[note];
    document.getElementById('targetNote').style.color = NOTE_COLORS[note];
    document.getElementById('progressLabel').textContent = `NOTES ${notesPlayed+1} / ${TOTAL_NOTES}`;
    notesPlayed++;
    drawHandpan(note);
    fallingNote = { note: note, x: NOTE_X[note], y: noteY };
    lastTime = 0;
    if (animationId) cancelAnimationFrame(animationId);
    animateNote();
}

function animateNote(timestamp) {
    if (!fallingNote || !gameRunning || !isGameReady) return;
    if (isPaused) { animationId = requestAnimationFrame(animateNote); return; }
    if (!timestamp) timestamp = performance.now();
    let dt = lastTime ? Math.min((timestamp-lastTime)/1000, 0.04) : 0.016;
    lastTime = timestamp;
    let speed = GAME_SPEED * speedMultiplier;
    fallingNote.y += speed * dt;
    drawFallingArea();
    drawDroplet(fallingNote.x, fallingNote.y, fallingNote.note);
    if (Math.abs(fallingNote.y - hitY) < 50) {
        let grad = ctx.createRadialGradient(fallingNote.x,fallingNote.y,3,fallingNote.x,fallingNote.y,30);
        grad.addColorStop(0,'rgba(255,255,255,0.15)');
        grad.addColorStop(1,'rgba(255,255,255,0)');
        ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(fallingNote.x,fallingNote.y,30,0,Math.PI*2); ctx.fill();
    }
    if (fallingNote.y > hitY + 45) {
        misses++; combo = 0; updateStats();
        // 🔊 صدای Miss
        playMissSound();
        fallingNote = null;
        if (notesPlayed >= TOTAL_NOTES) { setTimeout(finishGame, 200); return; }
        setTimeout(spawnNote, 200);
        return;
    }
    animationId = requestAnimationFrame(animateNote);
}

function hitNote(note) {
    if (!fallingNote || isPaused || !gameRunning || !isGameReady) return;
    if (note !== currentTarget) { combo = 0; updateStats(); return; }
    let dist = Math.abs(fallingNote.y - hitY);
    if (dist <= 70) {
        let pts = Math.max(50, 160 - Math.floor(dist * 1.6));
        score += pts + combo * 10;
        hits++; combo++;
        if (combo > bestCombo) bestCombo = combo;
        
        // 🔊 پخش صدای نت
        playHandpanNote(note, 0.5, 0.3);
        
        // 🔊 صدای COMBO
        if (combo > 0 && combo % 5 === 0) {
            playComboSound(combo);
        }
        
        drawHandpan(note);
        fallingNote = null;
        updateStats();
        if (notesPlayed >= TOTAL_NOTES) { setTimeout(finishGame, 150); return; }
        setTimeout(spawnNote, 150);
    }
}

function updateStats() {
    document.getElementById('scoreDisplay').textContent = `SCORE ${score}`;
    document.getElementById('comboDisplay').textContent = `COMBO ${combo}`;
    let total = hits + misses;
    let acc = total > 0 ? Math.round((hits/total)*100) : 0;
    document.getElementById('accuracyDisplay').textContent = `ACC ${acc}%`;
}

function finishGame() {
    gameRunning = false;
    isGameReady = false;
    if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    fallingNote = null;
    document.getElementById('timerOverlay').style.display = 'none';
    let total = hits + misses;
    let acc = total > 0 ? Math.round((hits/total)*100) : 0;
    if (currentLesson && !completed.includes(String(currentLesson.id))) {
        completed.push(String(currentLesson.id));
        localStorage.setItem('wepan_completed', JSON.stringify(completed));
    }
    let today = new Date().toDateString();
    let lastPractice = localStorage.getItem('wepan_last') || null;
    if (lastPractice !== today) {
        if (lastPractice === new Date(Date.now()-86400000).toDateString()) { streak++; }
        else { streak = 1; }
        localStorage.setItem('wepan_streak', streak);
        localStorage.setItem('wepan_last', today);
    }
    document.getElementById('gamePage').style.display = 'none';
    document.getElementById('resultPage').style.display = 'flex';
    document.getElementById('resultScore').textContent = score;
    document.getElementById('rHits').textContent = hits;
    document.getElementById('rAccuracy').textContent = acc + '%';
    document.getElementById('rCombo').textContent = bestCombo;
    document.getElementById('resultIcon').textContent = score > 200 ? '🏆' : score > 100 ? '🌟' : '💪';
    updateWelcomeStats();
}

function retryGame() {
    document.getElementById('resultPage').style.display = 'none';
    document.getElementById('gamePage').style.display = 'block';
    resetGame();
    drawHandpan();
    drawFallingArea();
    isGameReady = false;
    startTimer(() => {
        isGameReady = true;
        gameRunning = true;
        spawnNote();
    });
}

// ===== EVENTS =====
document.getElementById('pauseButton').addEventListener('click', function() {
    if (!gameRunning) return;
    isPaused = !isPaused;
    this.textContent = isPaused ? '▶ RESUME' : '⏸ PAUSE';
});

document.getElementById('speedSelect').addEventListener('change', function() {
    speedMultiplier = parseFloat(this.value);
});

document.getElementById('endGameBtn').addEventListener('click', function() {
    if (confirm('آیا می‌خوای بازی رو تموم کنی؟')) { finishGame(); }
});

document.getElementById('handpanCanvas').addEventListener('click', function(e) {
    if (!gameRunning || !isGameReady) return;
    let rect = this.getBoundingClientRect();
    let scaleX = 820/rect.width, scaleY = 280/rect.height;
    let mx = (e.clientX - rect.left)*scaleX, my = (e.clientY - rect.top)*scaleY;
    const pos = { "A":[430,55,20], "Bb":[510,85,20], "C":[545,145,20], "D_high":[510,205,20], "E":[430,235,20], "F":[350,205,20], "G":[315,145,20], "A_high":[350,85,20], "D":[430,145,34] };
    for (let [note,[x,y,r]] of Object.entries(pos)) {
        if (Math.sqrt((mx-x)**2+(my-y)**2) <= r) { hitNote(note); return; }
    }
});

// ===== RECORD =====
document.getElementById('recordButton').addEventListener('click', async function() {
    alert('🎤 ضبط فعال شد! (برای تست)');
});

// ===== دکمه تست صدا (برای دیباگ) =====
// اضافه کردن دکمه تست در کنسول