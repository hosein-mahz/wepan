from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import tempfile
import sys

app = Flask(__name__)

# ===== صفحه اصلی =====
@app.route('/')
def index():
    return render_template('index.html')

# ===== تحلیل صدا (با مدیریت خطا) =====
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # import librosa فقط در این تابع (برای کاهش مصرف)
        import librosa
        import numpy as np
        
        file = request.files['audio']
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            file.save(tmp.name)
            path = tmp.name
        
        y, sr = librosa.load(path, sr=22050, duration=2)
        pitches, mags = librosa.piptrack(y=y, sr=sr)
        
        detected = []
        note_names = ['C','D','E','F','G','A','Bb']
        for t in range(pitches.shape[1]):
            idx = mags[:,t].argmax()
            freq = pitches[idx,t]
            if 80 < freq < 1000:
                n = int((np.log2(freq/440)*12) % 12)
                n = max(0, min(11, n))
                notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
                if notes[n] in note_names:
                    detected.append(notes[n])
        
        os.unlink(path)
        return jsonify({'status':'success', 'detected_notes':list(dict.fromkeys(detected))[:5]})
        
    except Exception as e:
        return jsonify({'status':'error', 'message':str(e)}), 500

# ===== امتیازدهی =====
@app.route('/score', methods=['POST'])
def score():
    try:
        data = request.json
        expected = set(data.get('expectedNotes', []))
        detected = set(data.get('detectedNotes', []))
        correct = expected.intersection(detected)
        acc = (len(correct)/len(expected))*100 if expected else 0
        sc = max(0, min(100, acc*0.8 + 20 - len(detected-expected)*5))
        msg = '🎉 عالی!' if sc>=90 else '💪 خوب!' if sc>=70 else '📚 تمرین بیشتر'
        return jsonify({'score':round(sc), 'accuracy':round(acc,1), 'message':msg})
    except Exception as e:
        return jsonify({'status':'error', 'message':str(e)}), 500

# ===== سرویس دهی فایل‌های صوتی =====
@app.route('/sounds/<path:filename>')
def serve_sound(filename):
    return send_from_directory('sounds', filename)

# ===== اجرا (مهم برای Railway) =====
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)