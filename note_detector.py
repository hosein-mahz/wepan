import librosa
import numpy as np
from collections import Counter

# نت‌های هنگ‌درام
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
        
    def freq_to_note(self, freq):
        """تبدیل فرکانس به نزدیک‌ترین نت"""
        if freq == 0 or np.isnan(freq):
            return None
            
        # پیدا کردن نزدیک‌ترین نت
        closest_note = min(self.notes.items(), 
                          key=lambda x: abs(x[1] - freq))
        
        # اگر فاصله خیلی زیاد بود، نت رو نادیده بگیر
        if abs(closest_note[1] - freq) > 15:  # بیشتر از 15 هرتز اختلاف
            return None
            
        return closest_note[0]
    
    def detect_notes_from_file(self, audio_path, duration=3.0):
        """تشخیص نت‌ها از فایل صوتی"""
        try:
            # بارگذاری فایل
            y, sr = librosa.load(audio_path, sr=44100, duration=duration)
            
            # استخراج فرکانس‌ها
            pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
            
            detected = []
            # بررسی هر بازه زمانی
            for t in range(pitches.shape[1]):
                # پیدا کردن قوی‌ترین فرکانس در این بازه
                index = magnitudes[:, t].argmax()
                freq = pitches[index, t]
                note = self.freq_to_note(freq)
                if note:
                    detected.append(note)
            
            # حذف تکراری‌ها و مرتب‌سازی
            if detected:
                # بیشترین نت‌های تکرار شده رو انتخاب کن
                counter = Counter(detected)
                # حداقل ۲ بار تکرار شده باشه
                result = [note for note, count in counter.items() if count >= 2]
                return result if result else list(counter.keys())[:3]
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
        
        # امتیاز (با ملاحظات بیشتر)
        base_score = accuracy * 0.8 + 20
        
        # اگه نت اضافی زده (نت اشتباه)، جریمه
        extra_notes = detected_set - expected_set
        penalty = len(extra_notes) * 5
        final_score = max(0, base_score - penalty)
        
        # پیام متناسب با امتیاز
        if final_score >= 90:
            message = "عالی! 🎉 نت‌ها رو کامل و درست زدی!"
        elif final_score >= 70:
            message = "خوب! ولی می‌تونی بهتر بشی 💪"
        elif final_score >= 50:
            message = "نسبتاً خوب. بیشتر تمرین کن 📚"
        else:
            message = "به تمرین بیشتری نیاز داری. دوباره تلاش کن! 🎯"
        
        return {
            'accuracy': round(accuracy, 2),
            'score': round(final_score),
            'correct_notes': correct_count,
            'total_notes': total_expected,
            'correct_notes_list': list(correct_notes),
            'wrong_notes_list': list(detected_set - expected_set),
            'message': message
        }