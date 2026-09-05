from flask import Flask, render_template, request, jsonify
import os, tempfile, librosa, numpy as np

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
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
        return jsonify({'status':'error','message':str(e)}), 500

@app.route('/score', methods=['POST'])
def score():
    data = request.json
    expected = set(data.get('expectedNotes', []))
    detected = set(data.get('detectedNotes', []))
    correct = expected.intersection(detected)
    acc = (len(correct)/len(expected))*100 if expected else 0
    sc = max(0, min(100, acc*0.8 + 20 - len(detected-expected)*5))
    msg = '🎉 عالی!' if sc>=90 else '💪 خوب!' if sc>=70 else '📚 تمرین بیشتر'
    return jsonify({'score':round(sc), 'accuracy':round(acc,1), 'message':msg})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)