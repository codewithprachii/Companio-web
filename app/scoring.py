"""
Rule-based cognitive scoring engine for Companio.

Inspired by well-known clinical cognitive screening instruments
(e.g., MMSE, MoCA) but simplified and NOT a validated clinical tool.

This engine assigns scores per screening domain and maps the total
to a risk category. It also generates natural-language observations,
areas requiring attention, and suggested next steps based on the results.
"""

from typing import Dict, List

from app.models import RiskCategory

DOMAINS = [
    "memory",
    "attention",
    "orientation",
    "language",
    "recall",
    "problem_solving",
    "daily_life",
]

DOMAIN_WEIGHTS = {
    "memory": 1.0,
    "attention": 1.0,
    "orientation": 1.2,
    "language": 1.0,
    "recall": 1.3,
    "problem_solving": 1.1,
    "daily_life": 1.0,
}

RISK_THRESHOLDS = {
    RiskCategory.low: (24.0, 30.0),
    RiskCategory.moderate: (18.0, 23.99),
    RiskCategory.high: (0.0, 17.99),
}

DISCLAIMER = (
    "This assessment is a screening and decision-support tool, not a medical "
    "diagnosis. Results should be reviewed by a qualified healthcare "
    "professional. A clinical evaluation is recommended before any "
    "treatment or diagnostic decisions are made."
)

# Self-report frequency scale. Higher frequency of difficulty = worse,
# so the mapped value is inverted (Rarely is the best score).
FREQUENCY_SCORE = {
    "rarely": 4.0,
    "sometimes": 3.0,
    "frequently": 2.0,
    "very frequently": 1.0,
    "not sure": 0.0,
}
FREQUENCY_MAX = max(FREQUENCY_SCORE.values()) or 4.0


def _normalize_score(question, response_value) -> float:
    """Normalize a question's scored value to a 0-1 scale based on max_score."""
    if response_value is None:
        if question.max_score > 0:
            return 0.0
        return 0.0
    if question.max_score <= 0:
        return 1.0 if response_value > 0 else 0.0
    norm = response_value / question.max_score
    return max(0.0, min(1.0, norm))


def _map_score_to_category(score: float, max_score: float) -> RiskCategory:
    """Convert normalized score to risk category using MMSE-like thresholds."""
    pct = (score / max_score) * 30.0
    for category, (low, high) in RISK_THRESHOLDS.items():
        if low <= pct <= high:
            return category
    if pct > 30.0:
        return RiskCategory.low
    return RiskCategory.high


def _scaled_score(score: float, max_score: float) -> float:
    """Scale a score to the 0-30 instrument scale."""
    if max_score <= 0:
        return 0.0
    return round((score / max_score) * 30.0, 1)


def _domain_analysis(scores: Dict[str, float], max_scores: Dict[str, float]) -> tuple:
    """
    Given per-domain earned vs maximum scores, produce:
      - key observations (list of strings)
      - areas requiring attention (list of domain names)
      - normalized per-domain percentages
    """
    domain_pct = {}
    for domain in DOMAINS:
        if max_scores.get(domain, 0) > 0:
            domain_pct[domain] = round(
                (scores.get(domain, 0) / max_scores[domain]) * 100.0, 1
            )
        else:
            domain_pct[domain] = 100.0

    observations = []
    areas = []

    if domain_pct.get("orientation", 100) < 60:
        areas.append("orientation")
        observations.append(
            "Disorientation in time and/or place was observed, which may affect "
            "independence and safety."
        )
    if domain_pct.get("memory", 100) < 60:
        areas.append("memory")
        observations.append(
            "Immediate memory difficulties were noted, suggesting challenges "
            "retaining new information."
        )
    if domain_pct.get("recall", 100) < 60:
        areas.append("recall")
        observations.append(
            "Delayed recall was below expected, which is often an early indicator "
            "of cognitive decline."
        )
    if domain_pct.get("attention", 100) < 60:
        areas.append("attention")
        observations.append(
            "Reduced attention span observed; tasks requiring sustained focus "
            "were challenging."
        )
    if domain_pct.get("language", 100) < 60:
        areas.append("language")
        observations.append(
            "Language difficulties were observed in naming or repetition tasks."
        )
    if domain_pct.get("problem_solving", 100) < 60:
        areas.append("problem_solving")
        observations.append(
            "Problem-solving and abstract reasoning tasks were below expected, "
            "which may affect daily decision-making."
        )
    if domain_pct.get("daily_life", 100) < 60:
        areas.append("daily_life")
        observations.append(
            "Self-reported difficulties in everyday activities (finances, cooking, "
            "navigation) suggest functional impact."
        )

    if not observations:
        observations.append(
            "Performance was within expected ranges across most domains. "
            "No significant areas of concern were identified in this screening."
        )
    if not areas:
        areas.append("none")

    return observations, areas, domain_pct


def _next_steps(category: RiskCategory, areas: List[str]) -> List[str]:
    steps_map = {
        RiskCategory.low: [
            "Continue regular cognitive screening (every 6 months or as recommended).",
            "Maintain a healthy lifestyle including physical activity and social engagement.",
            "Address any modifiable risk factors and monitor for new symptoms.",
            "Consult a healthcare worker for a structured review and personalized prevention plan.",
        ],
        RiskCategory.moderate: [
            "Refer to a healthcare worker for a comprehensive clinical evaluation.",
            "Schedule a follow-up cognitive screening within 1-3 months to monitor changes.",
            "Alert the caregiver to monitor daily activities and medication adherence.",
            "Consider referral for further neuropsychological or medical assessment.",
        ],
        RiskCategory.high: [
            "Urgent referral for clinical evaluation by a qualified professional.",
            "Prioritize caregiver support and safety planning at home.",
            "Arrange early follow-up (within 2-4 weeks) and monitor for behavioral changes.",
            "Review medications and existing conditions with the care team.",
        ],
    }
    steps = list(steps_map.get(category, steps_map[RiskCategory.moderate]))

    area_specific = {
        "orientation": "Add orientation aids (calendar, clock, familiar cues) at home.",
        "memory": "Introduce memory aids such as notes, structured routines, and prompts.",
        "attention": "Break tasks into smaller steps and reduce distractions during activities.",
        "language": "Use simple, clear communication and allow extra time for responses.",
        "recall": "Monitor recall decline; review with a professional if it worsens.",
        "problem_solving": "Simplify choices and provide structured decision-making support.",
        "daily_life": "Review daily living support needs with the caregiver and care team.",
    }

    for area in areas:
        if area in area_specific:
            steps.append(area_specific[area])

    return steps


def grade_response(question, response_value, response_text) -> float:
    """
    Grade a single response into a raw score based on the question type.
    Uses is_correct / response_value when available, otherwise heuristics.
    """
    qtype = (question.type or "").lower()
    max_score = question.max_score or 1.0

    if response_value is not None:
        # Caller already provided a scored value (0..max_score)
        return max(0.0, min(max_score, float(response_value)))

    if response_text is None:
        return 0.0

    text = str(response_text).strip().lower()

    # Type-based heuristics
    if "yes" in qtype or qtype in ("yesno", "binary"):
        return max_score if text in ("yes", "true", "1") else 0.0

    if qtype in ("frequency", "likert", "scale"):
        mapped = FREQUENCY_SCORE.get(text)
        if mapped is None:
            return max_score * 0.5
        # Scale the 0..4 frequency value onto this question's max score.
        return (mapped / FREQUENCY_MAX) * max_score

    if qtype in ("numeric", "integer", "count"):
        try:
            val = float(text)
            # For count-down style, correct numeric answer expected
            return max_score if val > 0 else 0.0
        except ValueError:
            return 0.0

    if qtype in ("mcq", "choice", "selection"):
        # Assumes response_text contains an accepted marker; caller should pass
        # response_value for MCQ. Fallback: give partial credit.
        return max_score * 0.5

    # Free text / description based: heuristic scoring
    if text in ("", "n/a", "none", "don't know", "dont know", "no idea"):
        return 0.0
    if text in ("yes", "no", "maybe", "sometimes"):
        return max_score * 0.5
    return max_score * 0.8


def compute_assessment(session, responses) -> dict:
    """
    Compute an assessment dict from a completed session and its responses.

    Returns a dict compatible with the Assessment model fields:
      cognitive_score, max_score, risk_category, domain_scores,
      key_observations, areas_requiring_attention, suggested_next_steps, disclaimer
    """
    earned: Dict[str, float] = {}
    possible: Dict[str, float] = {}

    for resp in responses:
        q = resp.question
        domain = resp.domain or q.domain
        max_score = q.max_score if q else 1.0
        val = (
            resp.response_value
            if resp.response_value is not None
            else grade_response(q, None, resp.response_text)
        )
        earned[domain] = earned.get(domain, 0.0) + val
        possible[domain] = possible.get(domain, 0.0) + max_score

    total_earned = sum(earned.values())
    total_possible = sum(possible.values())
    if total_possible <= 0:
        total_possible = 1.0

    cognitive_score = _scaled_score(total_earned, total_possible)

    category = _map_score_to_category(total_earned, total_possible)

    observations, areas, domain_pct = _domain_analysis(earned, possible)

    next_steps = _next_steps(category, areas)

    domain_scores = {}
    for d in DOMAINS:
        domain_scores[d] = {
            "earned": round(earned.get(d, 0.0), 2),
            "max": round(possible.get(d, 0.0), 2),
            "percent": domain_pct.get(d, 100.0),
        }

    return {
        "cognitive_score": cognitive_score,
        "max_score": 30.0,
        "risk_category": category,
        "domain_scores": domain_scores,
        "key_observations": observations,
        "areas_requiring_attention": areas,
        "suggested_next_steps": next_steps,
        "disclaimer": DISCLAIMER,
    }
