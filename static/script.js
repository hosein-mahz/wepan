// =========================================================
// WEPAN 7.0 - وب
// =========================================================

let lessons = [];
let currentLesson = null;
let currentTarget = null;
let score = 0, hits = 0, misses = 0, combo = 0, bestCombo = 0;
let notesPlayed = 0;
const TOTAL_NOTES = 20;
let isPaused = false;
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let fallingNote = null;
let animationId = null;
let speedMultiplier = 1.0;
let canvas, ctx, panCanvas, panCtx;
let noteY = 20;
let hitY = 252;
let noteX = 430;
let targetNote = null;

// =========================================================
// NOTE DATA
// =========================================================

const NOTE_X = {
    "A_high": 75, "F": 170, "G": 265, "E": 355,
    "D": 430, "D_high": 500, "C": 595, "Bb": 690, "A": 760
};

const NOTE_COLORS = {
    "C": "#38bdf8", "D": "#60a5fa", "E": "#2dd4bf",
    "F": "#818cf8", "G": "#a78bfa", "A": "#f472b6",
    "Bb": "#fbbf24", "A_high": "#fb7185", "D_high": "#34d399"
};

const NOTE_LABELS = {
    "A": "A", "Bb": "Bb", "C": "C", "D_high": "D",
    "E": "E", "F": "F", "G": "G", "A_high": "A", "D": "D"
};

const ALL_NOTES = Object.keys(NOTE_X);

// =========================================================
// USER PROFILE
// =========================================================

const userProfile = {
    completed: JSON.parse(localStorage.getItem('wepan_completed')) || [],
    streak: parseInt(localStorage.getItem('wepan_streak')) || 0,
    totalScore: parseInt(localStorage.getItem('wepan_score')) || 0,
    lastPractice: localStorage.getItem('wepan_last') || null
};

// =========================================================
// LOAD LESSONS
// =========================================================

async function loadLessons() {
    try {
        const res = await fetch('/lessons');
        lessons = await res.json();
        renderLessons();
        updateStats();
    } catch (e) {
        console.error('Error loading lessons:', e);
    }
}

function renderLessons() {
    const container = document.getElementById('lessonsContainer');
    container.innerHTML = lessons.map((lesson, i) => {
        const done = userProfile.completed.includes(lesson.id);
        const locked = i > 0 && !userProfile.completed.includes(lessons[i-1].id);
        const icon = done ? '✅' : locked ? '🔒' : '▶️';
        return `
            <div class="lesson-card ${locked ? 'locked' : ''} ${done ? 'completed' : ''}"
                 onclick="${locked ? '' : `startLesson('${lesson.id}')`}">
                <div class="icon">${lesson.level === 1 ? '🌱' : lesson.level === 2 ? '🌿' : '🌟'}</div>
                <div class="info">
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description}</p>
                    <span class="level-tag">سطح ${lesson.level}</span>
                </div>
                <div class="status">${icon}</div>
            </div>
        `;
    }).join('');
}

function updateStats() {
    const total = lessons.length;
    const done = userProfile.completed.length;
    document.getElementById('totalLessons').textContent = total;
    document.getElementById('completedLessons').textContent = done;
    document.getElementById('streakCount').textContent = userProfile.streak;
    document.getElementById('progressBadge').textContent = `${Math.round((done/total)*100)}%`;
}

// =========================================================
// START LESSON
// =========================================================

function startLesson(lessonId) {
    currentLesson = lessons.find(l => l.id === lessonId);
    if (!currentLesson) return;
    
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('practicePage').style.display = 'block';
    
    document.getElementById('lessonTitle').textContent = currentLesson.title;
    document.getElementById('targetNote').textContent = '—';
    document.getElementById('targetNote').style.color = '#94a3b8';
    
    // Reset stats
    score = 0; hits = 0; misses = 0; combo = 0; bestCombo = 0; notesPlayed = 0;
    updatePracticeStats();
    document.getElementById('progressLabel').textContent = `NOTES 0 / ${TOTAL_NOTES}`;
    document.getElementById('resultArea').style.display = 'none';
    document.getElementById('recordStatus').textContent = '🎤 برای تمرین ضبط کن';
    document.getElementById('recordButton').className = 'record-btn';
    
    // Setup canvases
    setupCanvases();
    drawHandpan();
    drawFallingArea();
    
    // Spawn first note
    spawnNote();
}

// =========================================================
// CANVAS SETUP
// =========================================================

function setupCanvases() {
    canvas = document.getElementById('fallingCanvas');
    ctx = canvas.getContext('2d');
    panCanvas = document.getElementById('handpanCanvas');
    panCtx = panCanvas.getContext('2d');
    
    // Responsive
    const resize = () => {
        const rect = canvas.parentElement.getBoundingClientRect();
        const w = Math.min(820, rect.width - 12);
        canvas.style.width = w + 'px';
        canvas.style.height = (w * 315 / 820) + 'px';
        panCanvas.style.width = w + 'px';
        panCanvas.style.height = (w * 248 / 820) + 'px';
    };
    resize();
    window.addEventListener('resize', resize);
}

// =========================================================
// DRAW FALLING AREA
// =========================================================

function drawFallingArea() {
    const W = 820, H = 315;
    ctx.clearRect(0, 0, W, H);
    
    // Lines
    ctx.strokeStyle = '#17283a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(25, 15); ctx.lineTo(335, 15);
    ctx.moveTo(350, 15); ctx.lineTo(510, 15);
    ctx.moveTo(525, 15); ctx.lineTo(795, 15);
    ctx.stroke();
    
    ctx.fillStyle = '#475569';
    ctx.font = 'bold 8px Arial';
    ctx.fillText('EVEN', 180, 27);
    ctx.fillStyle = '#60a5fa';
    ctx.fillText('D • CENTER', 430, 27);
    ctx.fillStyle = '#475569';
    ctx.fillText('ODD', 660, 27);
    
    // Vertical lanes
    ctx.strokeStyle = '#1b2b3d';
    ctx.lineWidth = 1;
    for (let x of Object.values(NOTE_X)) {
        ctx.beginPath();
        ctx.moveTo(x, 42);
        ctx.lineTo(x, 267);
        ctx.stroke();
    }
    
    // Center D
    ctx.strokeStyle = '#315270';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(NOTE_X['D'], 38);
    ctx.lineTo(NOTE_X['D'], 272);
    ctx.stroke();
    
    // Hit line
    hitY = 252;
    ctx.strokeStyle = '#0ea5e9';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(18, hitY);
    ctx.lineTo(W - 18, hitY);
    ctx.stroke();
    
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18, hitY);
    ctx.lineTo(W - 18, hitY);
    ctx.stroke();
    
    // Number labels
    const laneNumbers = [
        [8, "A_high"], [6, "F"], [7, "G"], [5, "E"],
        [4, "D_high"], [3, "C"], [2, "Bb"], [1, "A"]
    ];
    ctx.font = 'bold 10px Arial';
    for (let [num, note] of laneNumbers) {
        const x = NOTE_X[note];
        ctx.fillStyle = '#94a3b8';
        ctx.fillText(num, x-6, hitY - 20);
        ctx.fillStyle = NOTE_COLORS[note];
        ctx.font = 'bold 8px Arial';
        ctx.fillText(NOTE_LABELS[note], x-6, hitY + 17);
        ctx.font = 'bold 10px Arial';
    }
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('D', NOTE_X['D']-8, hitY - 22);
    ctx.fillStyle = NOTE_COLORS['D'];
    ctx.font = 'bold 8px Arial';
    ctx.fillText('D', NOTE_X['D']-4, hitY + 17);
    
    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 9px Arial';
    ctx.fillText('HIT', W - 43, hitY - 40);
}

// =========================================================
// DRAW HANDPAN
// =========================================================

function drawHandpan(highlightNote = null) {
    const W = 820, H = 248;
    panCtx.clearRect(0, 0, W, H);
    
    // Frame
    panCtx.strokeStyle = '#18273a';
    panCtx.lineWidth = 2;
    panCtx.strokeRect(10, 10, 800, 228);
    panCtx.fillStyle = '#475569';
    panCtx.font = 'bold 9px Arial';
    panCtx.fillText('HANDPAN', 38, 27);
    
    // Handpan body
    const cx = 430, cy = 135, r = 100;
    panCtx.shadowColor = '#040810';
    panCtx.shadowBlur = 20;
    panCtx.beginPath();
    panCtx.arc(cx, cy, r, 0, Math.PI*2);
    panCtx.fillStyle = '#293646';
    panCtx.fill();
    panCtx.shadowBlur = 0;
    panCtx.strokeStyle = '#64748b';
    panCtx.lineWidth = 3;
    panCtx.stroke();
    
    panCtx.beginPath();
    panCtx.arc(cx, cy, r-7, 0, Math.PI*2);
    panCtx.fillStyle = '#263342';
    panCtx.fill();
    panCtx.strokeStyle = '#3f4e61';
    panCtx.lineWidth = 2;
    panCtx.stroke();
    
    // Notes
    const positions = {
        "A": [430, 55, 18], "Bb": [500, 82, 18], "C": [530, 135, 18],
        "D_high": [500, 190, 18], "E": [430, 215, 18], "F": [360, 190, 18],
        "G": [330, 135, 18], "A_high": [360, 82, 18], "D": [430, 135, 31]
    };
    
    for (let [note, [x, y, r2]] of Object.entries(positions)) {
        const color = NOTE_COLORS[note];
        const isHighlight = highlightNote === note;
        
        panCtx.shadowColor = '#111923';
        panCtx.shadowBlur = 10;
        panCtx.beginPath();
        panCtx.arc(x, y, r2+2, 0, Math.PI*2);
        panCtx.fillStyle = '#111923';
        panCtx.fill();
        panCtx.shadowBlur = 0;
        
        panCtx.beginPath();
        panCtx.arc(x, y, r2, 0, Math.PI*2);
        panCtx.fillStyle = isHighlight ? '#1a3a5a' : '#1d2835';
        panCtx.fill();
        panCtx.strokeStyle = isHighlight ? color : '#4a596d';
        panCtx.lineWidth = isHighlight ? 3 : 2;
        panCtx.stroke();
        
        panCtx.beginPath();
        panCtx.arc(x, y, r2-4, 0, Math.PI*2);
        panCtx.strokeStyle = color;
        panCtx.lineWidth = 1;
        panCtx.stroke();
        
        panCtx.fillStyle = isHighlight ? color : '#e5e7eb';
        panCtx.font = `bold ${note === 'D' ? 12 : 9}px Arial`;
        panCtx.textAlign = 'center';
        panCtx.textBaseline = 'middle';
        panCtx.fillText(NOTE_LABELS[note], x, y);
    }
}

// =========================================================
// SPAWN NOTE
// =========================================================

function spawnNote() {
    if (notesPlayed >= TOTAL_NOTES) {
        finishPractice();
        return;
    }
    
    const note = ALL_NOTES[Math.floor(Math.random() * ALL_NOTES.length)];
    currentTarget = note;
    targetNote = note;
    noteX = NOTE_X[note];
    noteY = 20;
    
    document.getElementById('targetNote').textContent = NOTE_LABELS[note];
    document.getElementById('targetNote').style.color = NOTE_COLORS[note];
    document.getElementById('progressLabel').textContent = `NOTES ${notesPlayed+1} / ${TOTAL_NOTES}`;
    notesPlayed++;
    
    // Highlight on handpan
    drawHandpan(note);
    
    fallingNote = { note, x: noteX, y: noteY };
    animateNote();
}

// =========================================================
// ANIMATE NOTE
// =========================================================

let lastTime = 0;

function animateNote(timestamp) {
    if (!fallingNote) return;
    if (isPaused) {
        animationId = requestAnimationFrame(animateNote);
        return;
    }
    
    const dt = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.04) : 0.016;
    lastTime = timestamp;
    
    const speed = 235 * speedMultiplier;
    fallingNote.y += speed * dt;
    
    // Draw
    drawFallingArea();
    drawDroplet(fallingNote.x, fallingNote.y, fallingNote.note);
    
    // Check miss
    if (fallingNote.y > hitY + 52) {
        misses++;
        combo = 0;
        updatePracticeStats();
        fallingNote = null;
        animationId = requestAnimationFrame(animateNote);
        setTimeout(spawnNote, 220);
        return;
    }
    
    // Glow when near hit line
    if (Math.abs(fallingNote.y - hitY) < 62) {
        drawHitGlow(fallingNote.x, fallingNote.y);
    }
    
    animationId = requestAnimationFrame(animateNote);
}

function drawDroplet(x, y, note) {
    const color = NOTE_COLORS[note];
    
    // Tail
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(x-3, y-31);
    ctx.quadraticCurveTo(x-8, y-55, x-5, y-70);
    ctx.quadraticCurveTo(x, y-78, x+5, y-70);
    ctx.quadraticCurveTo(x+8, y-55, x+3, y-31);
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Main droplet
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.moveTo(x, y-44);
    ctx.quadraticCurveTo(x+30, y-10, x+32, y+16);
    ctx.quadraticCurveTo(x+30, y+40, x+0, y+53);
    ctx.quadraticCurveTo(x-30, y+40, x-32, y+16);
    ctx.quadraticCurveTo(x-30, y-10, x, y-44);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Inner shine
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y-20);
    ctx.quadraticCurveTo(x+15, y-5, x+14, y+10);
    ctx.quadraticCurveTo(x+10, y+25, x+0, y+28);
    ctx.quadraticCurveTo(x-10, y+25, x-14, y+10);
    ctx.quadraticCurveTo(x-15, y-5, x, y-20);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.globalAlpha = 1;
    
    // Note label
    ctx.fillStyle = '#06121c';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(NOTE_LABELS[note], x, y+6);
}

function drawHitGlow(x, y) {
    const grad = ctx.createRadialGradient(x, y, 5, x, y, 40);
    grad.addColorStop(0, 'rgba(255,255,255,0.2)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 40, 0, Math.PI*2);
    ctx.fill();
}

// =========================================================
// HIT NOTE (از طریق کلیک روی هنگ‌درام)
// =========================================================

function hitNote(note) {
    if (!fallingNote || isPaused) return;
    if (note !== currentTarget) {
        combo = 0;
        updatePracticeStats();
        return;
    }
    
    const distance = Math.abs(fallingNote.y - hitY);
    if (distance <= 78) {
        const points = Math.max(60, 180 - Math.floor(distance * 1.8));
        const bonus = combo * 12;
        score += points + bonus;
        hits++;
        combo++;
        if (combo > bestCombo) bestCombo = combo;
        
        // Flash effect
        drawHandpan(note);
        
        fallingNote = null;
        updatePracticeStats();
        
        if (notesPlayed >= TOTAL_NOTES) {
            setTimeout(finishPractice, 180);
        } else {
            setTimeout(spawnNote, 180);
        }
    }
}

// =========================================================
// RECORD (ضبط با میکروفون)
// =========================================================

document.getElementById('recordButton').addEventListener('click', async function() {
    if (isRecording) {
        stopRecording();
        return;
    }
    await startRecording();
});

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        
        mediaRecorder.ondataavailable = e => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };
        
        mediaRecorder.onstop = async () => {
            const blob = new Blob(audioChunks, { type: 'audio/wav' });
            document.getElementById('recordStatus').textContent = '⏳ در حال تحلیل...';
            await analyzeAudio(blob);
        };
        
        mediaRecorder.start();
        isRecording = true;
        this.textContent = '⏹ توقف';
        this.className = 'record-btn recording';
        document.getElementById('recordStatus').textContent = '⏺ در حال ضبط...';
        
    } catch (e) {
        alert('❌ دسترسی به میکروفون داده نشد!');
        console.error(e);
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(t => t.stop());
        isRecording = false;
        document.getElementById('recordButton').textContent = '🎤 ضبط تمرین';
        document.getElementById('recordButton').className = 'record-btn';
    }
}

async function analyzeAudio(blob) {
    try {
        const formData = new FormData();
        formData.append('audio', blob, 'recording.wav');
        
        const res = await fetch('/analyze', { method: 'POST', body: formData });
        const data = await res.json();
        
        if (data.status === 'success') {
            const detected = data.detected_notes || [];
            // Check if any detected note matches expected
            const expected = currentLesson.expectedNotes || [];
            
            const scoreRes = await fetch('/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expectedNotes: expected, detectedNotes: detected })
            });
            const scoreData = await scoreRes.json();
            showResult(scoreData);
        } else {
            alert('❌ خطا: ' + data.message);
        }
    } catch (e) {
        console.error(e);
        alert('❌ خطا در ارتباط با سرور');
    }
    document.getElementById('recordStatus').textContent = '✅ تحلیل کامل شد!';
}

// =========================================================
// SHOW RESULT
// =========================================================

function showResult(data) {
    document.getElementById('resultArea').style.display = 'block';
    document.getElementById('resultScore').textContent = data.score || 0;
    document.getElementById('accuracyFill').style.width = `${data.accuracy || 0}%`;
    document.getElementById('resultMessage').textContent = data.message || '';
    
    // Save progress
    if (currentLesson) {
        const id = currentLesson.id;
        if (!userProfile.completed.includes(id)) {
            userProfile.completed.push(id);
        }
        userProfile.totalScore += data.score || 0;
        const today = new Date().toDateString();
        if (userProfile.lastPractice === today) {
            // already practiced today
        } else if (userProfile.lastPractice === new Date(Date.now() - 86400000).toDateString()) {
            userProfile.streak++;
        } else {
            userProfile.streak = 1;
        }
        userProfile.lastPractice = today;
        localStorage.setItem('wepan_completed', JSON.stringify(userProfile.completed));
        localStorage.setItem('wepan_score', userProfile.totalScore);
        localStorage.setItem('wepan_streak', userProfile.streak);
        localStorage.setItem('wepan_last', userProfile.lastPractice);
    }
    updateStats();
    renderLessons();
}

// =========================================================
// UPDATE STATS DISPLAY
// =========================================================

function updatePracticeStats() {
    document.getElementById('scoreDisplay').textContent = `SCORE ${score}`;
    document.getElementById('comboDisplay').textContent = `COMBO ${combo}`;
    const total = hits + misses;
    const acc = total > 0 ? Math.round((hits / total) * 100) : 0;
    document.getElementById('accuracyDisplay').textContent = `ACCURACY ${acc}%`;
}

// =========================================================
// FINISH PRACTICE
// =========================================================

function finishPractice() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    const total = hits + misses;
    const acc = total > 0 ? Math.round((hits / total) * 100) : 0;
    const msg = score > 200 ? '🎉 عالی!' : score > 100 ? '💪 خوب!' : '📚 تمرین بیشتری نیاز داری';
    showResult({ score: score, accuracy: acc, message: `${msg} امتیاز: ${score}` });
}

// =========================================================
// CONTROLS
// =========================================================

document.getElementById('pauseButton').addEventListener('click', function() {
    isPaused = !isPaused;
    this.textContent = isPaused ? '▶ RESUME' : '⏸ PAUSE';
});

document.getElementById('speedSelect').addEventListener('change', function() {
    speedMultiplier = parseFloat(this.value);
});

document.getElementById('backButton').addEventListener('click', function() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (isRecording) stopRecording();
    document.getElementById('practicePage').style.display = 'none';
    document.getElementById('homePage').style.display = 'block';
});

document.getElementById('retryButton').addEventListener('click', function() {
    if (currentLesson) startLesson(currentLesson.id);
});

document.getElementById('nextButton').addEventListener('click', function() {
    const idx = lessons.findIndex(l => l.id === currentLesson.id);
    if (idx < lessons.length - 1) {
        startLesson(lessons[idx+1].id);
    } else {
        alert('🎉 همه درس‌ها تموم شد!');
        document.getElementById('homePage').style.display = 'block';
        document.getElementById('practicePage').style.display = 'none';
    }
});

// =========================================================
// CLICK ON HANDPAN
// =========================================================

document.getElementById('handpanCanvas').addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const scaleX = 820 / rect.width;
    const scaleY = 248 / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    
    const positions = {
        "A": [430, 55, 18], "Bb": [500, 82, 18], "C": [530, 135, 18],
        "D_high": [500, 190, 18], "E": [430, 215, 18], "F": [360, 190, 18],
        "G": [330, 135, 18], "A_high": [360, 82, 18], "D": [430, 135, 31]
    };
    
    for (let [note, [x, y, r]] of Object.entries(positions)) {
        const dist = Math.sqrt((mx - x)**2 + (my - y)**2);
        if (dist <= r) {
            hitNote(note);
            return;
        }
    }
});

// =========================================================
// START
// =========================================================

loadLessons();