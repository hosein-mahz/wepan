import librosa
import numpy as np
from collections import Counter

# نت‌های هنگ‌درام (معمولاً ۷-۹ نت داره)
HANDPAN_NOTES = {
    'C3': 130.81,
    'D3': 146.83,
    'E3': 164.81,
    'G3': 196.00,
    'A3': 220.00,
    'C4': 261.63,
    'D4': 293.66,
    'E4': 329.63,
    'G4': 392.00,
    'A4': 440.00,
    'C5': 523.25,
}

class NoteDetector:
    def __init__(self):
        self.notes = HANDPAN_NOTES
        self.note_names = list(self.notes.keys())
        self.freqs = list(self.notes.values())
    
    def freq_to_note(self, freq):
        """تبدیل فرکانس به نزدیک‌ترین نت"""
        if freq == 0 or np.isnan(freq):
            return None
        
        # پیدا کردن نزدیک‌ترین نت
        closest_note = min(self.notes.items(), key=lambda x: abs(x[1] - freq))
        diff = abs(closest_note[1] - freq)
        
        # اگر فاصله خیلی زیاد بود، نت رو نادیده بگیر
        if diff > 15:
            return None
        
        return closest_note[0]
    
    def detect_notes_from_file(self, audio_path, duration=3.0):
        """تشخیص نت‌ها از فایل صوتی با دقت بالا"""
        try:
            # بارگذاری فایل
            y, sr = librosa.load(audio_path, sr=22050, duration=duration)
            
            # حذف سکوت‌های اولیه
            y, _ = librosa.effects.trim(y, top_db=30)
            
            if len(y) < 1000:
                return []
            
            # استخراج فرکانس‌ها با روش CQT (دقیق‌تر)
            cqt = np.abs(librosa.cqt(y, sr=sr, n_bins=72, bins_per_octave=12))
            
            # پیدا کردن قله‌های فرکانسی
            detected_notes = []
            
            # بررسی هر بازه زمانی
            for t in range(cqt.shape[1]):
                # پیدا کردن قوی‌ترین فرکانس در این بازه
                max_idx = cqt[:, t].argmax()
                freq = librosa.cqt_frequencies(n_bins=72, fmin=librosa.note_to_hz('C2'))[max_idx]
                note = self.freq_to_note(freq)
                if note:
                    detected_notes.append(note)
            
            # فیلتر کردن نت‌های کم‌تکرار
            if detected_notes:
                counter = Counter(detected_notes)
                # نت‌هایی که حداقل ۳ بار تکرار شدن
                result = [note for note, count in counter.items() if count >= 3]
                
                # اگر نتی پیدا نشد، ۳ نت پرتکرار رو برگردون
                if not result:
                    result = [note for note, _ in counter.most_common(3)]
                
                # حذف تکراری‌ها
                result = list(dict.fromkeys(result))
                return result[:5]  # حداکثر ۵ نت
            else:
                return []
                
        except Exception as e:
            print(f"Error detecting notes: {e}")
            return []
    
    def calculate_score(self, expected_notes, detected_notes):
        """محاسبه امتیاز و دقت"""
        if not expected_notes:
            return {
                'accuracy': 0,
                'score': 0,
                'message': 'نتی برای مقایسه وجود ندارد'
            }
        
        # تبدیل به set برای مقایسه راحت‌تر
        expected_set = set(expected_notes)
        detected_set = set(detected_notes)
        
        # نت‌های درست تشخیص داده شده
        correct_notes = expected_set.intersection(detected_set)
        correct_count = len(correct_notes)
        total_expected = len(expected_set)
        
        # دقت
        accuracy = (correct_count / total_expected) * 100 if total_expected > 0 else 0
        
        # امتیاز با جریمه برای نت‌های اضافی
        base_score = accuracy * 0.8 + 20
        extra_notes = detected_set - expected_set
        penalty = len(extra_notes) * 5
        final_score = max(0, min(100, base_score - penalty))
        
        # پیام متناسب با امتیاز
        if final_score >= 90:
            message = "🎉 عالی! نت‌ها رو کامل و درست زدی!"
        elif final_score >= 70:
            message = "💪 خوب! ولی می‌تونی بهتر بشی"
        elif final_score >= 50:
            message = "📚 نسبتاً خوب. بیشتر تمرین کن"
        else:
            message = "🎯 به تمرین بیشتری نیاز داری. دوباره تلاش کن!"
        
        return {
            'accuracy': round(accuracy, 2),
            'score': round(final_score),
            'correct_notes': correct_count,
            'total_notes': total_expected,
            'correct_notes_list': list(correct_notes),
            'wrong_notes_list': list(detected_set - expected_set),
            'message': message
        } }