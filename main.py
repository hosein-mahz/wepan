import customtkinter as ctk
import tkinter as tk
import time
import random


# =========================================================
# WEPAN
# Falling Notes 7.0
# =========================================================

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

app = ctk.CTk()
app.title("WEPAN")
app.geometry("1000x850")
app.minsize(900, 760)


# =========================================================
# GLOBAL STATE
# =========================================================

score = 0
hits = 0
misses = 0
combo = 0
best_combo = 0
notes_played = 0

TOTAL_NOTES = 20

animation_running = False
paused = False

current_target = None
falling_note = None
animation_job = None

last_frame_time = 0.0

speed_multiplier = 1.0


# =========================================================
# 9 NOTES
#
# LEFT  : EVEN NUMBERS
# CENTER: D
# RIGHT : ODD NUMBERS
# =========================================================

NOTE_LAYOUT = [
    (1, "C",  "left"),
    (3, "D5", "left"),
    (5, "F",  "left"),
    (7, "G",  "left"),

    (0, "D",  "center"),

    (8, "E",  "right"),
    (6, "A",  "right"),
    (4, "Bb", "right"),
    (2, "C5", "right"),
]

NOTE_COLORS = {
    "C": "#38bdf8",
    "D": "#60a5fa",
    "E": "#2dd4bf",
    "F": "#818cf8",
    "G": "#a78bfa",
    "A": "#f472b6",
    "Bb": "#fbbf24",
    "C5": "#fb7185",
    "D5": "#34d399"
}


# =========================================================
# EXACT HORIZONTAL POSITIONS
#
# Same X is used for:
# 1. Falling lane
# 2. HIT marker
# 3. Handpan note
# =========================================================

NOTE_X = {
    "C5": 115,
    "Bb": 205,
    "A": 295,
    "E": 350,

    "D": 430,

    "C": 510,
    "D5": 600,
    "F": 690,
    "G": 780,
}


# =========================================================
# GENERAL
# =========================================================

def clear_screen():
    global animation_job
    global animation_running

    animation_running = False

    if animation_job is not None:
        try:
            app.after_cancel(animation_job)
        except Exception:
            pass

    animation_job = None

    for widget in app.winfo_children():
        widget.destroy()


def create_header(parent, title, back_command):

    header = ctk.CTkFrame(
        parent,
        height=68,
        fg_color="#0d1422",
        corner_radius=0
    )

    header.pack(fill="x")
    header.pack_propagate(False)

    ctk.CTkButton(
        header,
        text="← Back",
        width=88,
        height=36,
        command=back_command
    ).pack(
        side="left",
        padx=18,
        pady=14
    )

    ctk.CTkLabel(
        header,
        text=title,
        font=ctk.CTkFont(
            size=24,
            weight="bold"
        )
    ).pack(
        side="left",
        padx=12
    )


# =========================================================
# HOME
# =========================================================

def home_screen():

    clear_screen()

    main = ctk.CTkFrame(
        app,
        fg_color="#070c15"
    )

    main.pack(
        fill="both",
        expand=True
    )

    ctk.CTkLabel(
        main,
        text="WEPAN",
        font=ctk.CTkFont(
            size=60,
            weight="bold"
        )
    ).pack(
        pady=(100, 8)
    )

    ctk.CTkLabel(
        main,
        text="Learn Handpan • Play • Improve",
        font=ctk.CTkFont(
            size=20
        ),
        text_color="#94a3b8"
    ).pack(
        pady=(0, 50)
    )

    ctk.CTkButton(
        main,
        text="▶  START LEARNING",
        width=300,
        height=62,
        font=ctk.CTkFont(
            size=21,
            weight="bold"
        ),
        command=learning_path
    ).pack(
        pady=12
    )

    ctk.CTkButton(
        main,
        text="🎵  QUICK PRACTICE",
        width=300,
        height=54,
        font=ctk.CTkFont(
            size=18
        ),
        command=practice_screen
    ).pack(
        pady=10
    )

    ctk.CTkLabel(
        main,
        text="WEPAN Demo",
        text_color="#64748b"
    ).pack(
        side="bottom",
        pady=28
    )


# =========================================================
# LEARNING PATH
# =========================================================

def learning_path():

    clear_screen()

    main = ctk.CTkFrame(
        app,
        fg_color="#070c15"
    )

    main.pack(
        fill="both",
        expand=True
    )

    create_header(
        main,
        "Learning Path",
        home_screen
    )

    content = ctk.CTkFrame(
        main,
        fg_color="transparent"
    )

    content.pack(
        fill="both",
        expand=True,
        padx=80,
        pady=45
    )

    ctk.CTkLabel(
        content,
        text="Your Learning Journey",
        font=ctk.CTkFont(
            size=32,
            weight="bold"
        )
    ).pack(
        pady=(0, 30)
    )

    lessons = [
        (
            "Lesson 01",
            "Meet the Handpan",
            "Learn the basic notes"
        ),
        (
            "Lesson 02",
            "First Rhythm",
            "Play your first rhythm"
        ),
        (
            "Lesson 03",
            "Falling Notes",
            "Follow the falling notes"
        )
    ]

    for i, (title, subtitle, description) in enumerate(
        lessons,
        1
    ):

        card = ctk.CTkFrame(
            content,
            height=105,
            corner_radius=18,
            fg_color="#141d2d"
        )

        card.pack(
            fill="x",
            pady=9
        )

        card.pack_propagate(False)

        ctk.CTkLabel(
            card,
            text=f"{i:02d}",
            width=65,
            font=ctk.CTkFont(
                size=27,
                weight="bold"
            )
        ).pack(
            side="left",
            padx=20
        )

        text_frame = ctk.CTkFrame(
            card,
            fg_color="transparent"
        )

        text_frame.pack(
            side="left",
            fill="both",
            expand=True
        )

        ctk.CTkLabel(
            text_frame,
            text=title,
            anchor="w",
            font=ctk.CTkFont(
                size=19,
                weight="bold"
            )
        ).pack(
            anchor="w",
            pady=(16, 2)
        )

        ctk.CTkLabel(
            text_frame,
            text=f"{subtitle}  •  {description}",
            anchor="w",
            text_color="#94a3b8"
        ).pack(
            anchor="w"
        )

        ctk.CTkButton(
            card,
            text="PLAY →",
            width=120,
            height=42,
            command=lambda lesson=i: lesson_screen(
                lesson
            )
        ).pack(
            side="right",
            padx=20
        )


# =========================================================
# LESSON
# =========================================================

def lesson_screen(lesson_number):

    clear_screen()

    main = ctk.CTkFrame(
        app,
        fg_color="#070c15"
    )

    main.pack(
        fill="both",
        expand=True
    )

    create_header(
        main,
        f"Lesson {lesson_number:02d}",
        learning_path
    )

    content = ctk.CTkFrame(
        main,
        fg_color="#111a2a",
        corner_radius=22
    )

    content.pack(
        fill="both",
        expand=True,
        padx=110,
        pady=55
    )

    if lesson_number == 1:

        title = "Meet the Handpan"

        text = (
            "Learn the basic notes of the handpan.\n\n"
            "Explore the position of every note."
        )

    elif lesson_number == 2:

        title = "First Rhythm"

        text = (
            "Practice your first rhythm.\n\n"
            "Focus on timing and keeping a steady pulse."
        )

    else:

        title = "Falling Notes"

        text = (
            "Watch the falling drops.\n\n"
            "Each drop follows the exact path of its note."
        )

    ctk.CTkLabel(
        content,
        text=title,
        font=ctk.CTkFont(
            size=36,
            weight="bold"
        )
    ).pack(
        pady=(65, 20)
    )

    ctk.CTkLabel(
        content,
        text=text,
        justify="center",
        font=ctk.CTkFont(
            size=18
        ),
        text_color="#cbd5e1"
    ).pack(
        pady=20
    )

    ctk.CTkButton(
        content,
        text="START PRACTICE  →",
        width=280,
        height=58,
        font=ctk.CTkFont(
            size=19,
            weight="bold"
        ),
        command=practice_screen
    ).pack(
        pady=40
    )


# =========================================================
# PRACTICE
# =========================================================

def practice_screen():

    global score
    global hits
    global misses
    global combo
    global best_combo
    global notes_played
    global animation_running
    global paused
    global current_target
    global falling_note
    global speed_multiplier
    global last_frame_time

    clear_screen()

    score = 0
    hits = 0
    misses = 0
    combo = 0
    best_combo = 0
    notes_played = 0

    speed_multiplier = 1.0

    animation_running = True
    paused = False

    current_target = None
    falling_note = None

    last_frame_time = time.perf_counter()

    # =====================================================
    # MAIN
    # =====================================================

    main = ctk.CTkFrame(
        app,
        fg_color="#050a12"
    )

    main.pack(
        fill="both",
        expand=True
    )

    # =====================================================
    # HEADER
    # =====================================================

    top = ctk.CTkFrame(
        main,
        height=64,
        fg_color="#0d1422",
        corner_radius=0
    )

    top.pack(fill="x")
    top.pack_propagate(False)

    ctk.CTkButton(
        top,
        text="← Back",
        width=84,
        height=36,
        command=learning_path
    ).pack(
        side="left",
        padx=15,
        pady=14
    )

    ctk.CTkLabel(
        top,
        text="FALLING NOTES",
        font=ctk.CTkFont(
            size=21,
            weight="bold"
        )
    ).pack(
        side="left",
        padx=10
    )

    stats = ctk.CTkFrame(
        top,
        fg_color="transparent"
    )

    stats.pack(
        side="right",
        padx=15
    )

    score_label = ctk.CTkLabel(
        stats,
        text="SCORE  0",
        font=ctk.CTkFont(
            size=14,
            weight="bold"
        )
    )

    score_label.pack(
        side="left",
        padx=8
    )

    combo_label = ctk.CTkLabel(
        stats,
        text="COMBO  0",
        font=ctk.CTkFont(
            size=14,
            weight="bold"
        )
    )

    combo_label.pack(
        side="left",
        padx=8
    )

    accuracy_label = ctk.CTkLabel(
        stats,
        text="ACCURACY  0%",
        font=ctk.CTkFont(
            size=14,
            weight="bold"
        )
    )

    accuracy_label.pack(
        side="left",
        padx=8
    )

    # =====================================================
    # NEXT NOTE
    # =====================================================

    target_area = ctk.CTkFrame(
        main,
        height=73,
        fg_color="transparent"
    )

    target_area.pack(
        fill="x"
    )

    target_area.pack_propagate(False)

    ctk.CTkLabel(
        target_area,
        text="NEXT NOTE",
        text_color="#4f83b8",
        font=ctk.CTkFont(
            size=11,
            weight="bold"
        )
    ).pack(
        pady=(3, 0)
    )

    target_label = ctk.CTkLabel(
        target_area,
        text="—",
        font=ctk.CTkFont(
            size=34,
            weight="bold"
        )
    )

    target_label.pack()

    # =====================================================
    # FALLING AREA
    # =====================================================

    falling_holder = ctk.CTkFrame(
        main,
        fg_color="#09111e",
        corner_radius=20,
        border_width=1,
        border_color="#1c2a3d"
    )

    falling_holder.pack(
        fill="x",
        padx=45,
        pady=(0, 9)
    )

    canvas_width = 820
    canvas_height = 315

    canvas = tk.Canvas(
        falling_holder,
        width=canvas_width,
        height=canvas_height,
        bg="#09111e",
        highlightthickness=0
    )

    canvas.pack(
        padx=7,
        pady=7
    )

    # =====================================================
    # THREE HIT SECTIONS
    # =====================================================

    # مرز بخش چپ
    canvas.create_line(
        25,
        15,
        335,
        15,
        fill="#17283a",
        width=1
    )

    # مرز بخش وسط
    canvas.create_line(
        350,
        15,
        510,
        15,
        fill="#1e3950",
        width=2
    )

    # مرز بخش راست
    canvas.create_line(
        525,
        15,
        795,
        15,
        fill="#17283a",
        width=1
    )

    # عنوان بخش‌ها
    canvas.create_text(
        180,
        27,
        text="EVEN",
        fill="#475569",
        font=("Arial", 8, "bold")
    )

    canvas.create_text(
        430,
        27,
        text="D • CENTER",
        fill="#60a5fa",
        font=("Arial", 8, "bold")
    )

    canvas.create_text(
        660,
        27,
        text="ODD",
        fill="#475569",
        font=("Arial", 8, "bold")
    )

    # =====================================================
    # SPACED LANES
    # =====================================================

    for note, x in NOTE_X.items():

        # لاین بسیار کم‌رنگ
        canvas.create_line(
            x,
            42,
            x,
            267,
            fill="#1b2b3d",
            width=1
        )

    # =====================================================
    # CENTER D SPECIAL LINE
    # =====================================================

    canvas.create_line(
        NOTE_X["D"],
        38,
        NOTE_X["D"],
        272,
        fill="#315270",
        width=2
    )

    # =====================================================
    # HIT LINE
    # =====================================================

    hit_y = 252

    # لاین اصلی
    canvas.create_line(
        18,
        hit_y,
        canvas_width - 18,
        hit_y,
        fill="#0ea5e9",
        width=5
    )

    # خط نازک روی آن
    canvas.create_line(
        18,
        hit_y,
        canvas_width - 18,
        hit_y,
        fill="#67e8f9",
        width=2
    )

    # =====================================================
    # NUMBER LABELS ON HIT LINE
    # =====================================================

    # چپ = زوج
    left_numbers = [
        (2, "C5"),
        (4, "Bb"),
        (6, "A"),
        (8, "E"),
    ]

    for number, note in left_numbers:

        x = NOTE_X[note]

        canvas.create_text(
            x,
            hit_y - 20,
            text=str(number),
            fill="#94a3b8",
            font=("Arial", 10, "bold")
        )

        canvas.create_text(
            x,
            hit_y + 17,
            text=note,
            fill=NOTE_COLORS[note],
            font=("Arial", 8, "bold")
        )

    # مرکز
    canvas.create_text(
        NOTE_X["D"],
        hit_y - 22,
        text="5",
        fill="#60a5fa",
        font=("Arial", 13, "bold")
    )

    canvas.create_text(
        NOTE_X["D"],
        hit_y + 18,
        text="D",
        fill="#60a5fa",
        font=("Arial", 9, "bold")
    )

    # راست = فرد
    right_numbers = [
        (1, "C"),
        (3, "D5"),
        (7, "F"),
        (9, "G"),
    ]

    for number, note in right_numbers:

        x = NOTE_X[note]

        canvas.create_text(
            x,
            hit_y - 20,
            text=str(number),
            fill="#94a3b8",
            font=("Arial", 10, "bold")
        )

        canvas.create_text(
            x,
            hit_y + 17,
            text=note,
            fill=NOTE_COLORS[note],
            font=("Arial", 8, "bold")
        )

    # =====================================================
    # HIT ZONE TEXT
    # =====================================================

    canvas.create_text(
        canvas_width - 43,
        hit_y - 40,
        text="HIT",
        fill="#67e8f9",
        font=("Arial", 9, "bold")
    )

    # =====================================================
    # HANDPAN AREA
    # =====================================================

    pan_zone = ctk.CTkFrame(
        main,
        width=820,
        height=248,
        fg_color="#0b1320",
        corner_radius=18,
        border_width=1,
        border_color="#1c2a3d"
    )

    pan_zone.pack(
        padx=45,
        pady=(0, 7)
    )

    pan_zone.pack_propagate(False)

    pan_canvas = tk.Canvas(
        pan_zone,
        width=820,
        height=248,
        bg="#0b1320",
        highlightthickness=0
    )

    pan_canvas.pack()

    # =====================================================
    # SQUARE FRAME
    # =====================================================

    pan_canvas.create_rectangle(
        10,
        10,
        810,
        238,
        outline="#18273a",
        width=2
    )

    pan_canvas.create_text(
        38,
        27,
        text="HANDPAN",
        fill="#475569",
        font=("Arial", 9, "bold")
    )

    # =====================================================
    # ROUND HANDPAN
    # =====================================================

    pan_cx = 430
    pan_cy = 135
    pan_r = 100

    # shadow
    pan_canvas.create_oval(
        pan_cx - pan_r - 5,
        pan_cy - pan_r - 5,
        pan_cx + pan_r + 5,
        pan_cy + pan_r + 5,
        fill="#040810",
        outline=""
    )

    # body
    pan_canvas.create_oval(
        pan_cx - pan_r,
        pan_cy - pan_r,
        pan_cx + pan_r,
        pan_cy + pan_r,
        fill="#293646",
        outline="#64748b",
        width=3
    )

    # inner body
    pan_canvas.create_oval(
        pan_cx - pan_r + 7,
        pan_cy - pan_r + 7,
        pan_cx + pan_r - 7,
        pan_cy + pan_r - 7,
        fill="#263342",
        outline="#3f4e61",
        width=2
    )

    # =====================================================
    # HANDPAN NOTES
    #
    # مرتب شده مطابق سمت Falling Notes
    # =====================================================

    handpan_positions = {

        # left
        "C5": (370, 178, 18),
        "Bb": (325, 135, 18),
        "A": (350, 88, 18),
        "E": (398, 75, 18),

        # center
        "D": (430, 135, 31),

        # right
        "C": (462, 75, 18),
        "D5": (510, 88, 18),
        "F": (535, 135, 18),
        "G": (490, 178, 18),
    }

    # note areas
    for note, (x, y, r) in handpan_positions.items():

        color = NOTE_COLORS[note]

        # subtle shadow
        pan_canvas.create_oval(
            x - r - 2,
            y - r - 2,
            x + r + 2,
            y + r + 2,
            fill="#111923",
            outline=""
        )

        # note
        pan_canvas.create_oval(
            x - r,
            y - r,
            x + r,
            y + r,
            fill="#1d2835",
            outline="#4a596d",
            width=2,
            tags=(f"pan_{note}",)
        )

        # colored ring
        pan_canvas.create_oval(
            x - r + 4,
            y - r + 4,
            x + r - 4,
            y + r - 4,
            outline=color,
            width=1,
            tags=(f"pan_{note}",)
        )

        # name
        pan_canvas.create_text(
            x,
            y,
            text=note,
            fill="#e5e7eb",
            font=(
                "Arial",
                12 if note == "D" else 9,
                "bold"
            ),
            tags=(f"pan_{note}",)
        )

        # click
        pan_canvas.tag_bind(
            f"pan_{note}",
            "<Button-1>",
            lambda event, n=note: hit_note(n)
        )

        # hover
        pan_canvas.tag_bind(
            f"pan_{note}",
            "<Enter>",
            lambda event, n=note: hover_note(
                n,
                True
            )
        )

        pan_canvas.tag_bind(
            f"pan_{note}",
            "<Leave>",
            lambda event, n=note: hover_note(
                n,
                False
            )
        )

    # =====================================================
    # CONTROLS
    # =====================================================

    controls = ctk.CTkFrame(
        main,
        fg_color="transparent"
    )

    controls.pack(
        fill="x",
        padx=45,
        pady=(0, 5)
    )

    pause_button = ctk.CTkButton(
        controls,
        text="Ⅱ  PAUSE",
        width=110,
        height=34,
        command=toggle_pause
    )

    pause_button.pack(
        side="left"
    )

    # SPEED
    speed_box = ctk.CTkFrame(
        controls,
        fg_color="#111a29",
        corner_radius=10
    )

    speed_box.pack(
        side="left",
        padx=14
    )

    ctk.CTkLabel(
        speed_box,
        text="SPEED",
        text_color="#64748b",
        font=ctk.CTkFont(
            size=10,
            weight="bold"
        )
    ).pack(
        side="left",
        padx=(9, 3)
    )

    ctk.CTkButton(
        speed_box,
        text="−",
        width=30,
        height=28,
        command=decrease_speed
    ).pack(
        side="left",
        padx=2,
        pady=3
    )

    speed_label = ctk.CTkLabel(
        speed_box,
        text="1.00×",
        width=55,
        font=ctk.CTkFont(
            size=13,
            weight="bold"
        )
    )

    speed_label.pack(
        side="left"
    )

    ctk.CTkButton(
        speed_box,
        text="+",
        width=30,
        height=28,
        command=increase_speed
    ).pack(
        side="left",
        padx=2,
        pady=3
    )

    progress_label = ctk.CTkLabel(
        controls,
        text=f"NOTES 0 / {TOTAL_NOTES}",
        text_color="#64748b"
    )

    progress_label.pack(
        side="right"
    )

    # Save refs
    practice_screen.canvas = canvas
    practice_screen.pan_canvas = pan_canvas

    practice_screen.target_label = target_label

    practice_screen.score_label = score_label
    practice_screen.combo_label = combo_label
    practice_screen.accuracy_label = accuracy_label

    practice_screen.progress_label = progress_label
    practice_screen.pause_button = pause_button
    practice_screen.speed_label = speed_label

    practice_screen.hit_y = hit_y

    spawn_next_note()


# =========================================================
# HANDPAN HOVER
# =========================================================

def hover_note(note, entering):

    canvas = practice_screen.pan_canvas

    ids = canvas.find_withtag(
        f"pan_{note}"
    )

    if not ids:
        return

    color = NOTE_COLORS[note]

    for item in ids:

        item_type = canvas.type(item)

        if entering:

            if item_type == "oval":
                canvas.itemconfigure(
                    item,
                    outline=color,
                    width=2
                )

            elif item_type == "text":
                canvas.itemconfigure(
                    item,
                    fill=color
                )

        else:

            if item_type == "oval":
                canvas.itemconfigure(
                    item,
                    outline="#4a596d",
                    width=2
                )

            elif item_type == "text":
                canvas.itemconfigure(
                    item,
                    fill="#e5e7eb"
                )


# =========================================================
# DROPLET
# =========================================================

def droplet_points(
    x,
    y,
    scale=1.0
):

    points = [

        (0, -44),

        (5, -37),
        (10, -30),
        (16, -22),
        (22, -13),

        (27, -4),
        (31, 6),
        (32, 16),

        (31, 25),
        (27, 34),
        (22, 41),
        (15, 47),

        (8, 51),
        (0, 53),

        (-8, 51),
        (-15, 47),
        (-22, 41),
        (-27, 34),

        (-31, 25),
        (-32, 16),
        (-31, 6),

        (-27, -4),
        (-22, -13),
        (-16, -22),
        (-10, -30),
        (-5, -37)
    ]

    result = []

    for px, py in points:

        result.extend([
            x + px * scale,
            y + py * scale
        ])

    return result


def tail_points(
    x,
    y,
    scale=1.0
):

    return [

        x - 2 * scale,
        y - 31 * scale,

        x + 2 * scale,
        y - 31 * scale,

        x + 4 * scale,
        y - 70 * scale,

        x - 4 * scale,
        y - 70 * scale
    ]


# =========================================================
# CREATE DROPLET
# =========================================================

def create_falling_note(
    canvas,
    x,
    y,
    note
):

    color = NOTE_COLORS[note]

    item = {}

    # خیلی کم هاله
    outer = canvas.create_polygon(
        droplet_points(
            x,
            y,
            1.20
        ),
        fill=darken_color(
            color,
            0.16
        ),
        outline="",
        smooth=True
    )

    # هاله داخلی
    glow = canvas.create_polygon(
        droplet_points(
            x,
            y,
            1.06
        ),
        fill=darken_color(
            color,
            0.30
        ),
        outline="",
        smooth=True
    )

    # دنباله
    tail_outer = canvas.create_polygon(
        tail_points(
            x,
            y,
            0.95
        ),
        fill=darken_color(
            color,
            0.13
        ),
        outline="",
        smooth=True
    )

    tail = canvas.create_polygon(
        tail_points(
            x,
            y,
            0.58
        ),
        fill=color,
        outline="",
        smooth=True
    )

    # خود قطره
    head = canvas.create_polygon(
        droplet_points(
            x,
            y,
            0.70
        ),
        fill=color,
        outline=lighten_color(
            color
        ),
        width=1,
        smooth=True
    )

    # مرکز روشن
    inner = canvas.create_polygon(
        droplet_points(
            x,
            y + 1,
            0.42
        ),
        fill=lighten_color(
            color,
            0.50
        ),
        outline="",
        smooth=True
    )

    # درخشش کوچک
    shine = canvas.create_oval(
        x - 4,
        y - 22,
        x + 2,
        y - 11,
        fill="#ffffff",
        outline=""
    )

    # نام نت
    text = canvas.create_text(
        x,
        y + 7,
        text=note,
        fill="#06121c",
        font=("Arial", 8, "bold")
    )

    item["outer"] = outer
    item["glow"] = glow
    item["tail_outer"] = tail_outer
    item["tail"] = tail
    item["head"] = head
    item["inner"] = inner
    item["shine"] = shine
    item["text"] = text

    return item


# =========================================================
# COLORS
# =========================================================

def darken_color(
    color,
    factor=0.25
):

    color = color.lstrip("#")

    try:

        r = int(
            color[0:2],
            16
        )

        g = int(
            color[2:4],
            16
        )

        b = int(
            color[4:6],
            16
        )

    except Exception:

        return "#0f3042"

    r = max(
        0,
        int(r * factor)
    )

    g = max(
        0,
        int(g * factor)
    )

    b = max(
        0,
        int(b * factor)
    )

    return (
        f"#{r:02x}"
        f"{g:02x}"
        f"{b:02x}"
    )


def lighten_color(
    color,
    factor=0.55
):

    color = color.lstrip("#")

    try:

        r = int(
            color[0:2],
            16
        )

        g = int(
            color[2:4],
            16
        )

        b = int(
            color[4:6],
            16
        )

    except Exception:

        return "#e0f2fe"

    r = min(
        255,
        int(
            r +
            (255 - r) *
            factor
        )
    )

    g = min(
        255,
        int(
            g +
            (255 - g) *
            factor
        )
    )

    b = min(
        255,
        int(
            b +
            (255 - b) *
            factor
        )
    )

    return (
        f"#{r:02x}"
        f"{g:02x}"
        f"{b:02x}"
    )


# =========================================================
# MOVE
# =========================================================

def move_falling_note(
    item,
    dx,
    dy
):

    canvas = practice_screen.canvas

    for key in [
        "outer",
        "glow",
        "tail_outer",
        "tail",
        "head",
        "inner",
        "shine",
        "text"
    ]:

        canvas.move(
            item[key],
            dx,
            dy
        )


# =========================================================
# DELETE
# =========================================================

def delete_falling_note():

    global falling_note

    if falling_note is None:
        return

    canvas = practice_screen.canvas

    for key in falling_note:

        try:
            canvas.delete(
                falling_note[key]
            )
        except Exception:
            pass

    falling_note = None


# =========================================================
# CENTER
# =========================================================

def get_falling_note_center():

    if falling_note is None:
        return None

    canvas = practice_screen.canvas

    coords = canvas.coords(
        falling_note["head"]
    )

    if not coords:
        return None

    xs = coords[0::2]
    ys = coords[1::2]

    return (
        sum(xs) / len(xs),
        sum(ys) / len(ys)
    )


# =========================================================
# SPAWN
# =========================================================

def spawn_next_note():

    global current_target
    global falling_note
    global notes_played
    global animation_running
    global last_frame_time

    if not animation_running:
        return

    if notes_played >= TOTAL_NOTES:

        finish_practice()

        return

    canvas = practice_screen.canvas

    note = random.choice(
        list(NOTE_X.keys())
    )

    # مهم:
    # قطره دقیقاً از لاین همین نت شروع می‌شود.
    x = NOTE_X[note]

    y = 20

    current_target = note

    notes_played += 1

    practice_screen.target_label.configure(
        text=note,
        text_color=NOTE_COLORS[note]
    )

    practice_screen.progress_label.configure(
        text=(
            f"NOTES "
            f"{notes_played} / "
            f"{TOTAL_NOTES}"
        )
    )

    falling_note = create_falling_note(
        canvas,
        x,
        y,
        note
    )

    last_frame_time = time.perf_counter()

    animate_note()


# =========================================================
# ANIMATION
# =========================================================

def animate_note():

    global animation_job
    global last_frame_time
    global misses
    global combo
    global current_target

    if not animation_running:
        return

    if paused:

        last_frame_time = time.perf_counter()

        animation_job = app.after(
            30,
            animate_note
        )

        return

    if falling_note is None:
        return

    now = time.perf_counter()

    dt = (
        now -
        last_frame_time
    )

    last_frame_time = now

    dt = min(
        dt,
        0.04
    )

    # سرعت پایه
    base_speed = 235

    actual_speed = (
        base_speed *
        speed_multiplier
    )

    move_falling_note(
        falling_note,
        0,
        actual_speed * dt
    )

    center = get_falling_note_center()

    if center is None:
        return

    x, y = center

    distance = abs(
        y -
        practice_screen.hit_y
    )

    # نزدیک خط
    if distance < 62:

        try:

            practice_screen.canvas.itemconfigure(
                falling_note["head"],
                outline="#ffffff",
                width=2
            )

        except Exception:
            pass

    # MISS
    if (
        y >
        practice_screen.hit_y +
        52
    ):

        misses += 1

        combo = 0

        delete_falling_note()

        current_target = None

        update_stats()

        if notes_played >= TOTAL_NOTES:

            finish_practice()

        else:

            animation_job = app.after(
                220,
                spawn_next_note
            )

        return

    animation_job = app.after(
        16,
        animate_note
    )


# =========================================================
# HIT
# =========================================================

def hit_note(note):

    global score
    global hits
    global combo
    global best_combo
    global current_target
    global animation_job

    if not animation_running:
        return

    if paused:
        return

    if current_target is None:
        return

    # نت اشتباه
    if note != current_target:

        combo = 0

        update_stats()

        return

    center = get_falling_note_center()

    if center is None:
        return

    x, y = center

    distance = abs(
        y -
        practice_screen.hit_y
    )

    # محدوده HIT
    if distance <= 78:

        points = max(
            60,
            180 -
            int(
                distance *
                1.8
            )
        )

        combo_bonus = (
            combo *
            12
        )

        score += (
            points +
            combo_bonus
        )

        hits += 1

        combo += 1

        if combo > best_combo:

            best_combo = combo

        delete_falling_note()

        current_target = None

        update_stats()

        if notes_played >= TOTAL_NOTES:

            finish_practice()

        else:

            animation_job = app.after(
                180,
                spawn_next_note
            )


# =========================================================
# STATS
# =========================================================

def update_stats():

    attempts = (
        hits +
        misses
    )

    if attempts:

        accuracy = int(
            hits /
            attempts *
            100
        )

    else:

        accuracy = 0

    practice_screen.score_label.configure(
        text=f"SCORE  {score}"
    )

    practice_screen.combo_label.configure(
        text=f"COMBO  {combo}"
    )

    practice_screen.accuracy_label.configure(
        text=f"ACCURACY  {accuracy}%"
    )


# =========================================================
# PAUSE
# =========================================================

def toggle_pause():

    global paused

    if not animation_running:
        return

    paused = not paused

    if paused:

        practice_screen.pause_button.configure(
            text="▶  RESUME"
        )

    else:

        practice_screen.pause_button.configure(
            text="Ⅱ  PAUSE"
        )


# =========================================================
# SPEED
# =========================================================

def update_speed():

    practice_screen.speed_label.configure(
        text=f"{speed_multiplier:.2f}×"
    )


def decrease_speed():

    global speed_multiplier

    if speed_multiplier > 0.25:

        speed_multiplier = round(
            speed_multiplier - 0.25,
            2
        )

        update_speed()


def increase_speed():

    global speed_multiplier

    if speed_multiplier < 1.50:

        speed_multiplier = round(
            speed_multiplier + 0.25,
            2
        )

        update_speed()


# =========================================================
# FINISH
# =========================================================

def finish_practice():

    global animation_running
    global current_target
    global animation_job

    animation_running = False

    current_target = None

    if animation_job is not None:

        try:
            app.after_cancel(
                animation_job
            )
        except Exception:
            pass

    animation_job = None

    delete_falling_note()

    result_screen()


# =========================================================
# RESULT
# =========================================================

def result_screen():

    clear_screen()

    main = ctk.CTkFrame(
        app,
        fg_color="#070c15"
    )

    main.pack(
        fill="both",
        expand=True
    )

    create_header(
        main,
        "Practice Complete",
        learning_path
    )

    attempts = (
        hits +
        misses
    )

    if attempts:

        accuracy = int(
            hits /
            attempts *
            100
        )

    else:

        accuracy = 0

    content = ctk.CTkFrame(
        main,
        fg_color="#111a2a",
        corner_radius=24
    )

    content.pack(
        fill="both",
        expand=True,
        padx=170,
        pady=55
    )

    ctk.CTkLabel(
        content,
        text="✦  GREAT JOB!",
        font=ctk.CTkFont(
            size=38,
            weight="bold"
        )
    ).pack(
        pady=(45, 20)
    )

    ctk.CTkLabel(
        content,
        text=str(score),
        font=ctk.CTkFont(
            size=58,
            weight="bold"
        )
    ).pack()

    ctk.CTkLabel(
        content,
        text="SCORE",
        text_color="#64748b"
    ).pack(
        pady=(0, 28)
    )

    stats = ctk.CTkFrame(
        content,
        fg_color="#172235",
        corner_radius=18
    )

    stats.pack(
        fill="x",
        padx=45,
        pady=10
    )

    data = [
        ("HITS", hits),
        ("ACCURACY", f"{accuracy}%"),
        ("BEST COMBO", best_combo)
    ]

    for label, value in data:

        item = ctk.CTkFrame(
            stats,
            fg_color="transparent"
        )

        item.pack(
            side="left",
            fill="x",
            expand=True,
            pady=22
        )

        ctk.CTkLabel(
            item,
            text=str(value),
            font=ctk.CTkFont(
                size=26,
                weight="bold"
            )
        ).pack()

        ctk.CTkLabel(
            item,
            text=label,
            text_color="#64748b"
        ).pack()

    ctk.CTkButton(
        content,
        text="PLAY AGAIN",
        width=260,
        height=54,
        font=ctk.CTkFont(
            size=18,
            weight="bold"
        ),
        command=practice_screen
    ).pack(
        pady=(30, 10)
    )

    ctk.CTkButton(
        content,
        text="← Learning Path",
        width=220,
        height=40,
        fg_color="transparent",
        border_width=1,
        command=learning_path
    ).pack()


# =========================================================
# START
# =========================================================

home_screen()

app.mainloop()