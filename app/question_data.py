"""Default cognitive screening questions for Companio.

Self-report frequency questions used by the patient-facing Companio UI.
Answers are mapped to scores as: Rarely = 4, Sometimes = 3,
Frequently = 2, Very Frequently = 1, Not sure = 0. Higher frequency
of difficulty means a lower score (worse).
"""

DEFAULT_QUESTIONS = [
    {
        "domain": "memory",
        "question_text": "Do they have difficulty remembering recent events?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "memory",
        "question_text": "Do they repeat the same questions or stories?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "memory",
        "question_text": "Do they forget names of familiar people?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "memory",
        "question_text": "Do they have difficulty recognising familiar faces?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "memory",
        "question_text": "Do they forget appointments or important events?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "language",
        "question_text": "Do they have difficulty finding the right words?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "orientation",
        "question_text": "Do they become confused about where they are?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "daily_life",
        "question_text": "Do they need reminders for daily activities?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "daily_life",
        "question_text": "Do they have difficulty managing medicines?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "attention",
        "question_text": "Do they become anxious or frustrated when confused?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "language",
        "question_text": "Do they have difficulty following conversations?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "daily_life",
        "question_text": "Do they have difficulty completing familiar tasks?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "memory",
        "question_text": "Do they forget where everyday objects are kept?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "memory",
        "question_text": "Do they have difficulty remembering instructions?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
    {
        "domain": "attention",
        "question_text": "Do they have difficulty following multi-step instructions?",
        "type": "frequency",
        "max_score": 4.0,
        "instruction": "Rarely = best (4), Sometimes = 3, Frequently = 2, Very Frequently = 1, Not sure = 0.",
    },
]