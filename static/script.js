let currentLesson = null;
let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let lessons = [];
let completedLessons = {};

// بارگذاری درس‌ها
async function loadLessons() {
    try {
        const response = await fetch('/lessons');
        lessons = await response.json();
        
        // بارگذاری پیشرفت از localStorage
        const saved = localStorage.getItem('handpan_progress');
        if (saved) {
            completedLessons = JSON.parse(saved);
        }
        
        renderLessons();
        updateStats();
    } catch (error) {
        console.error('Error loading lessons:', error);
        document.getElementById('lessonsContainer').innerHTML = 
            '<p style="color:red;text-align:center;">خطا در بارگذاری درس‌ها</p>';
    }
}

// رندر درس‌ها
function renderLessons() {
    const container = document.getElementById('lessonsContainer');
    
    container.innerHTML = lessons.map((lesson, index) => {
        const isCompleted = completedLessons[lesson.id];
        const isLocked = index > 0 && !completedLessons[lessons[index-1].id];
        const statusIcon = isCompleted ? '✅' : (isLocked ? '🔒' : '▶️');
        
        return `
            <div class="lesson-card ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}" 
                 onclick="${isLocked ? '' : `startLesson('${lesson.id}')`}">
                <div class="icon">${lesson.level === 1 ? '🌱' : lesson.level === 2 ? '🌿' : '🌟'}</div>
                <div class="info">
                    <h3>${lesson.title}</h3>
                    <p>${lesson.description}</p>
                    <span class="level-tag">سطح ${lesson.level}</span>
                    ${isCompleted ? `<span style="font-size:11px;color:var(--success);margin-right:8px;">امتیاز: ${completedLessons[lesson.id]}</span>` : ''}
                </div>
                <div class="status">${statusIcon}</div>
            </div>
        `;
    }).join('');
}

// به‌روزرسانی آمار
function updateStats() {
    const total = lessons.length;
    const completed = Object.keys(completedLessons).length;
    const scores = Object.values(completedLessons);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a,b) => a+b, 0) / scores.length) : 0;
    
    document.getElementById('totalLessons').textContent = total;
    document.getElementById('completedLessons').textContent = completed;
    document.getElementById('avgScore').textContent = avg;
    document.getElementById('progressBadge').textContent = `${Math.round((completed/total)*100)}%`;
}

// شروع درس
async function startLesson(lessonId) {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    currentLesson = lesson;
    
    document.getElementById('homePage').style.display = 'none';
    document.getElementById('practicePage').style.display = 'block';
    
    document.getElementById('lessonTitle').textContent = lesson.title;
    document.getElementById('lessonDescription').textContent = lesson.description;
    
    // نمایش نت‌ها
    const expectedDiv = document.getElementById('expectedNotesDisplay');
    expectedDiv.innerHTML = lesson.expectedNotes.map(note => 
        `<div class="note-bubble">${note}</div>`
    ).join('');
    
    // ریست کردن
    document.getElementById('resultArea').style.display = 'none';
    document.getElementById('audioPlayer').style.display = 'none';
    document.getElementById('recordingStatus').textContent = '🎤 برای شروع ضبط بزن';
    document.getElementById('recordButton').className = 'record-btn';
    document.getElementById('recordButton').textContent = '🎤';
    
    // تغییر متن دکمه بعدی
    const nextBtn = document.getElementById('nextLessonButton');
    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    if (currentIndex < lessons.length - 1) {
        nextBtn.textContent = `درس بعدی →`;
        nextBtn.onclick = () => {
            const nextLesson = lessons[currentIndex + 1];
            if (completedLessons[nextLesson.id]) {
                startLesson(nextLesson.id);
            } else {
                startLesson(nextLesson.id);
            }
        };
    } else {
        nextBtn.textContent = '🎉 همه درس‌ها تموم شد!';
        nextBtn.onclick = () => goHome();
    }
}

// ضبط
document.getElementById('recordButton').addEventListener('click', function() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false
            }
        });
        
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/webm'
        });
        audioChunks = [];
        
        mediaRecorder.ondataavailable = event => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            
            // تبدیل به WAV برای سرور
            const wavBlob = await convertToWav(audioBlob);
            const audioUrl = URL.createObjectURL(wavBlob);
            
            const player = document.getElementById('audioPlayer');
            player.src = audioUrl;
            player.style.display = 'block';
            
            document.getElementById('recordingStatus').textContent = '⏳ در حال تحلیل...';
            
            await analyzeAudio(wavBlob);
        };
        
        mediaRecorder.start();
        isRecording = true;
        
        this.textContent = '⏹';
        this.className = 'record-btn recording';
        document.getElementById('recordingStatus').textContent = '⏺ در حال ضبط...';
        
    } catch (error) {
        alert('❌ دسترسی به میکروفون داده نشد!');
        console.error(error);
    }
}

function stopRecording() {
    if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        isRecording = false;
        
        document.getElementById('recordButton').textContent = '🎤';
        document.getElementById('recordButton').className = 'record-btn';
        document.getElementById('recordingStatus').textContent = '⏹ ضبط متوقف شد';
    }
}

// تبدیل WebM به WAV (ساده شده)
async function convertToWav(webmBlob) {
    // اگه مرورگر از AudioContext پشتیبانی کنه
    try {
        const arrayBuffer = await webmBlob.arrayBuffer();
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // ایجاد WAV
        const wavBuffer = audioBufferToWav(audioBuffer);
        return new Blob([wavBuffer], { type: 'audio/wav' });
    } catch (e) {
        // اگه نشد، همون WebM رو بفرست
        return webmBlob;
    }
}

function audioBufferToWav(buffer) {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    
    const samples = buffer.getChannelData(0);
    const dataLength = samples.length * 2;
    const bufferLength = 44 + dataLength;
    const arrayBuffer = new ArrayBuffer(bufferLength);
    const view = new DataView(arrayBuffer);
    
    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, dataLength, true);
    
    // داده‌ها
    let offset = 44;
    for (let i = 0; i < samples.length; i++) {
        const sample = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
    }
    
    return arrayBuffer;
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

// آنالیز صدا
async function analyzeAudio(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');
        
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            const scoreResponse = await fetch('/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expectedNotes: currentLesson.expectedNotes,
                    detectedNotes: result.detected_notes
                })
            });
            
            const scoreResult = await scoreResponse.json();
            showResult(scoreResult, result.detected_notes);
        } else {
            alert('❌ خطا: ' + result.message);
        }
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ خطا در ارتباط با سرور');
        document.getElementById('recordingStatus').textContent = '❌ خطا! دوباره تلاش کن';
    }
}

// نمایش نتیجه
function showResult(scoreResult, detectedNotes) {
    const resultArea = document.getElementById('resultArea');
    resultArea.style.display = 'block';
    
    document.getElementById('scoreDisplay').textContent = scoreResult.score;
    document.getElementById('accuracyFill').style.width = `${scoreResult.accuracy}%`;
    document.getElementById('accuracyText').textContent = `${scoreResult.accuracy}%`;
    document.getElementById('resultMessage').textContent = scoreResult.message;
    
    // نمایش نت‌های تشخیص داده شده
    const detectedDiv = document.getElementById('detectedNotesDisplay');
    if (detectedNotes && detectedNotes.length > 0) {
        detectedDiv.innerHTML = detectedNotes.map(note => {
            const isCorrect = currentLesson.expectedNotes.includes(note);
            return `<div class="note-bubble ${isCorrect ? 'correct' : 'wrong'}">${note}</div>`;
        }).join('');
    } else {
        detectedDiv.innerHTML = '<div style="color:var(--gray);">هیچ نتی تشخیص داده نشد</div>';
    }
    
    document.getElementById('recordingStatus').textContent = '✅ تحلیل کامل شد!';
    
    // ذخیره پیشرفت
    completedLessons[currentLesson.id] = scoreResult.score;
    localStorage.setItem('handpan_progress', JSON.stringify(completedLessons));
    updateStats();
    renderLessons();
}

// بازگشت
document.getElementById('backButton').addEventListener('click', goHome);

function goHome() {
    document.getElementById('homePage').style.display = 'block';
    document.getElementById('practicePage').style.display = 'none';
    renderLessons();
    updateStats();
    
    // توقف ضبط اگه در حال ضبطه
    if (isRecording) {
        stopRecording();
    }
}

// تمرین دوباره
document.getElementById('retryButton').addEventListener('click', function() {
    document.getElementById('resultArea').style.display = 'none';
    document.getElementById('audioPlayer').style.display = 'none';
    document.getElementById('recordingStatus').textContent = '🎤 برای شروع ضبط بزن';
    document.getElementById('recordButton').className = 'record-btn';
    document.getElementById('recordButton').textContent = '🎤';
});

// شروع
loadLessons();