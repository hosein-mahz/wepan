import customtkinter as ctk
import random

# =========================
# تنظیمات اصلی
# =========================

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

app = ctk.CTk()
app.title("WEPAN")
app.geometry("950x750")
app.minsize(850, 650)

# =========================
# وضعیت برنامه
# =========================

current_lesson = "LESSON 01"

score = 0
hits = 0
total_notes = 0
combo = 0
best_combo = 0

practice_limit = 10


# =========================
# ابزارهای عمومی
# =========================

def clear_screen():
    for widget in app.winfo_children():
        widget.destroy()


def make_back_button(command):
    button = ctk.CTkButton(
        app,
        text="← BACK",
        width=140,
        height=40,
        font=("Arial", 15, "bold"),
        command=command
    )
    button.pack(pady=15)


# =========================
# صفحه شروع
# =========================

def home_screen():
    clear_screen()

    title = ctk.CTkLabel(
        app,
        text="WEPAN",
        font=("Arial", 58, "bold")
    )
    title.pack(pady=(110, 10))

    subtitle = ctk.CTkLabel(
        app,
        text="Learn • Practice • Play",
        font=("Arial", 22)
    )
    subtitle.pack(pady=10)

    info = ctk.CTkLabel(
        app,
        text="Interactive Handpan Learning",
        font=("Arial", 16)
    )
    info.pack(pady=5)

    start_button = ctk.CTkButton(
        app,
        text="START LEARNING",
        width=300,
        height=65,
        corner_radius=20,
        font=("Arial", 20, "bold"),
        command=learning_path
    )
    start_button.pack(pady=45)


# =========================
# مسیر آموزش
# =========================

def learning_path():
    clear_screen()

    title = ctk.CTkLabel(
        app,
        text="LEARNING PATH",
        font=("Arial", 38, "bold")
    )
    title.pack(pady=(35, 5))

    subtitle = ctk.CTkLabel(
        app,
        text="Choose your next lesson",
        font=("Arial", 18)
    )
    subtitle.pack(pady=(0, 25))

    lessons = [
        ("LESSON 01", "Basic Notes", "Learn the basic handpan notes"),
        ("LESSON 02", "Simple Rhythm", "Practice your first rhythm"),
        ("LESSON 03", "First Melody", "Play your first melody"),
    ]

    for lesson_name, lesson_title, description in lessons:

        frame = ctk.CTkFrame(
            app,
            width=550,
            height=100,
            corner_radius=18
        )
        frame.pack(pady=8)
        frame.pack_propagate(False)

        lesson_label = ctk.CTkLabel(
            frame,
            text=lesson_name,
            font=("Arial", 20, "bold")
        )
        lesson_label.pack(pady=(12, 0))

        desc_label = ctk.CTkLabel(
            frame,
            text=f"{lesson_title}  •  {description}",
            font=("Arial", 14)
        )
        desc_label.pack(pady=4)

        button = ctk.CTkButton(
            frame,
            text="OPEN",
            width=100,
            height=32,
            command=lambda l=lesson_name: lesson_screen(l)
        )
        button.pack()

    make_back_button(home_screen)


# =========================
# صفحه درس
# =========================

def lesson_screen(lesson):
    global current_lesson

    current_lesson = lesson

    clear_screen()

    title = ctk.CTkLabel(
        app,
        text=lesson,
        font=("Arial", 42, "bold")
    )
    title.pack(pady=(90, 15))

    if lesson == "LESSON 01":
        lesson_title = "Basic Notes"
        description = "Learn to recognize and play basic notes."

    elif lesson == "LESSON 02":
        lesson_title = "Simple Rhythm"
        description = "Practice timing and simple rhythms."

    else:
        lesson_title = "First Melody"
        description = "Combine notes and play your first melody."

    name_label = ctk.CTkLabel(
        app,
        text=lesson_title,
        font=("Arial", 26, "bold")
    )
    name_label.pack(pady=10)

    description_label = ctk.CTkLabel(
        app,
        text=description,
        font=("Arial", 17)
    )
    description_label.pack(pady=10)

    start_button = ctk.CTkButton(
        app,
        text="START PRACTICE",
        width=300,
        height=65,
        corner_radius=20,
        font=("Arial", 19, "bold"),
        command=practice_screen
    )
    start_button.pack(pady=35)

    make_back_button(learning_path)


# =========================
# شروع تمرین
# =========================

def practice_screen():
    global score
    global hits
    global total_notes
    global combo
    global best_combo

    score = 0
    hits = 0
    total_notes = 0
    combo = 0
    best_combo = 0

    clear_screen()

    # -------------------------
    # عنوان
    # -------------------------

    title = ctk.CTkLabel(
        app,
        text="HANDPAN PRACTICE",
        font=("Arial", 30, "bold")
    )
    title.pack(pady=(15, 3))

    lesson_label = ctk.CTkLabel(
        app,
        text=current_lesson,
        font=("Arial", 14)
    )
    lesson_label.pack()

    # -------------------------
    # اطلاعات تمرین
    # -------------------------

    info_frame = ctk.CTkFrame(
        app,
        width=650,
        height=70,
        corner_radius=15
    )
    info_frame.pack(pady=8)
    info_frame.pack_propagate(False)

    score_label = ctk.CTkLabel(
        info_frame,
        text="SCORE\n0",
        font=("Arial", 15, "bold")
    )
    score_label.place(relx=0.18, rely=0.5, anchor="center")

    combo_label = ctk.CTkLabel(
        info_frame,
        text="COMBO\n0",
        font=("Arial", 15, "bold")
    )
    combo_label.place(relx=0.50, rely=0.5, anchor="center")

    progress_label = ctk.CTkLabel(
        info_frame,
        text="NOTES\n0 / 10",
        font=("Arial", 15, "bold")
    )
    progress_label.place(relx=0.82, rely=0.5, anchor="center")

    # -------------------------
    # نت هدف
    # -------------------------

    target_label = ctk.CTkLabel(
        app,
        text="TARGET",
        font=("Arial", 15)
    )
    target_label.pack(pady=(3, 0))

    target_note_label = ctk.CTkLabel(
        app,
        text="D",
        font=("Arial", 38, "bold")
    )
    target_note_label.pack(pady=(0, 5))

    # -------------------------
    # هندپن
    # -------------------------

    pan = ctk.CTkFrame(
        app,
        width=580,
        height=390,
        corner_radius=190,
        border_width=4
    )
    pan.pack(pady=5)
    pan.pack_propagate(False)

    # -------------------------
    # نت‌های هندپن
    # -------------------------

    notes = [
        ("D", 0, 0),
        ("A", -145, -65),
        ("Bb", 145, -65),
        ("C", -175, 55),
        ("E", 175, 55),
        ("F", -115, 135),
        ("G", 115, 135),
        ("A2", -45, 160),
        ("C2", 45, 160),
    ]

    note_buttons = []

    # -------------------------
    # پیام
    # -------------------------

    message = ctk.CTkLabel(
        app,
        text="Play the target note",
        font=("Arial", 16, "bold")
    )
    message.pack(pady=3)

    # -------------------------
    # انتخاب نت بعدی
    # -------------------------

    def next_target():
        available = [note[0] for note in notes]
        return random.choice(available)

    target_note = next_target()
    target_note_label.configure(text=target_note)

    # -------------------------
    # اجرای نت
    # -------------------------

    def play_note(note):

        global score
        global hits
        global total_notes
        global combo
        global best_combo

        if total_notes >= practice_limit:
            return

        total_notes += 1

        target = target_note_label.cget("text")

        if note == target:

            hits += 1
            combo += 1

            if combo > best_combo:
                best_combo = combo

            points = 10 + (combo - 1) * 2
            score += points

            message.configure(
                text=f"✓ PERFECT!  +{points}"
            )

        else:

            combo = 0

            message.configure(
                text=f"Try again • Target was {target}"
            )

        score_label.configure(
            text=f"SCORE\n{score}"
        )

        combo_label.configure(
            text=f"COMBO\n{combo}"
        )

        progress_label.configure(
            text=f"NOTES\n{total_notes} / {practice_limit}"
        )

        # -------------------------
        # پایان تمرین
        # -------------------------

        if total_notes >= practice_limit:

            app.after(
                500,
                lambda: result_screen()
            )

            return

        # نت جدید

        new_target = next_target()
        target_note_label.configure(
            text=new_target
        )

    # -------------------------
    # ساخت دکمه نت‌ها
    # -------------------------

    for note, x, y in notes:

        button = ctk.CTkButton(
            pan,
            text=note,
            width=72,
            height=72,
            corner_radius=36,
            font=("Arial", 16, "bold"),
            command=lambda n=note: play_note(n)
        )

        button.place(
            relx=0.5,
            rely=0.5,
            x=x,
            y=y,
            anchor="center"
        )

        note_buttons.append(button)

    # -------------------------
    # Back
    # -------------------------

    make_back_button(
        lambda: lesson_screen(current_lesson)
    )


# =========================
# نتیجه تمرین
# =========================

def result_screen():
    clear_screen()

    accuracy = 0

    if total_notes > 0:
        accuracy = int((hits / total_notes) * 100)

    # -------------------------
    # عنوان
    # -------------------------

    title = ctk.CTkLabel(
        app,
        text="PRACTICE COMPLETE",
        font=("Arial", 38, "bold")
    )
    title.pack(pady=(70, 20))

    subtitle = ctk.CTkLabel(
        app,
        text="Great job! Keep practicing.",
        font=("Arial", 20)
    )
    subtitle.pack(pady=5)

    # -------------------------
    # امتیاز
    # -------------------------

    score_label = ctk.CTkLabel(
        app,
        text=str(score),
        font=("Arial", 60, "bold")
    )
    score_label.pack(pady=(35, 0))

    score_text = ctk.CTkLabel(
        app,
        text="TOTAL SCORE",
        font=("Arial", 16)
    )
    score_text.pack()

    # -------------------------
    # آمار
    # -------------------------

    stats_frame = ctk.CTkFrame(
        app,
        width=600,
        height=130,
        corner_radius=20
    )
    stats_frame.pack(pady=30)
    stats_frame.pack_propagate(False)

    accuracy_label = ctk.CTkLabel(
        stats_frame,
        text=f"ACCURACY\n{accuracy}%",
        font=("Arial", 18, "bold")
    )
    accuracy_label.place(
        relx=0.20,
        rely=0.5,
        anchor="center"
    )

    hits_label = ctk.CTkLabel(
        stats_frame,
        text=f"HITS\n{hits}",
        font=("Arial", 18, "bold")
    )
    hits_label.place(
        relx=0.50,
        rely=0.5,
        anchor="center"
    )

    combo_label = ctk.CTkLabel(
        stats_frame,
        text=f"BEST COMBO\n{best_combo}",
        font=("Arial", 18, "bold")
    )
    combo_label.place(
        relx=0.80,
        rely=0.5,
        anchor="center"
    )

    # -------------------------
    # دکمه تمرین دوباره
    # -------------------------

    retry_button = ctk.CTkButton(
        app,
        text="PRACTICE AGAIN",
        width=280,
        height=55,
        corner_radius=18,
        font=("Arial", 17, "bold"),
        command=practice_screen
    )
    retry_button.pack(pady=8)

    # -------------------------
    # برگشت به مسیر
    # -------------------------

    path_button = ctk.CTkButton(
        app,
        text="LEARNING PATH",
        width=280,
        height=55,
        corner_radius=18,
        font=("Arial", 17, "bold"),
        command=learning_path
    )
    path_button.pack(pady=8)

    # -------------------------
    # Back
    # -------------------------

    make_back_button(
        lambda: lesson_screen(current_lesson)
    )


# =========================
# اجرای برنامه
# =========================

home_screen()

app.mainloop()