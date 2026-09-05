from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import os
import tempfile
from note_detector import NoteDetector
import json

app = Flask(__name__)
CORS(app)
detector = NoteDetector()

# صفحه اصلی
@app.route('/')
def index():
    return render_template('index.html')

# تشخیص نت از فایل صوتی
@app.route('/analyze', methods=['POST'])
def analyze_audio():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'فایل صوتی ارسال نشده'}), 400
        
        audio_file = request.files['audio']
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as tmp:
            audio_file.save(tmp.name)
            tmp_path = tmp.name
        
        detected_notes = detector.detect_notes_from_file(tmp_path)
        os.unlink(tmp_path)
        
        return jsonify({
            'status': 'success',
            'detected_notes': detected_notes
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# محاسبه امتیاز
@app.route('/score', methods=['POST'])
def calculate_score():
    try:
        data = request.json
        expected = data.get('expectedNotes', [])
        detected = data.get('detectedNotes', [])
        
        result = detector.calculate_score(expected, detected)
        result['status'] = 'success'
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# دریافت لیست درس‌ها
@app.route('/lessons', methods=['GET'])
def get_lessons():
    # اینجا می‌تونی از Firebase یا یه فایل JSON استفاده کنی
    lessons = [
        {
            'id': '1',
            'title': 'نت C4',
            'description': 'یک ضربه آروم روی نت C4 بزن',
            'level': 1,
            'expectedNotes': ['C4']
        },
        {
            'id': '2',
            'title': 'نت D4',
            'description': 'روی نت D4 ضربه بزن',
            'level': 1,
            'expectedNotes': ['D4']
        },
        {
            'id': '3',
            'title': 'ترکیب C4 و D4',
            'description': 'به ترتیب C4 و D4 رو بزن',
            'level': 2,
            'expectedNotes': ['C4', 'D4']
        }
    ]
    return jsonify(lessons)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)