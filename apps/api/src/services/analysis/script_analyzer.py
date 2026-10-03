import re
import logging
from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class BaseScriptAnalyzer(ABC):
    @abstractmethod
    def analyze(self, script_text: str) -> Dict[str, Any]:
        """Analyze script text and return structured metrics and candidate moments."""
        pass

class RuleBasedScriptAnalyzer(BaseScriptAnalyzer):
    def __init__(self, baseline_wpm: float = 150.0):
        self.baseline_wpm = baseline_wpm

    @staticmethod
    def _extract_sentences(text: str) -> List[str]:
        """Split text into sentences cleanly."""
        raw_sentences = re.split(r'(?<=[.!?])\s+', text.strip())
        sentences = [s.strip() for s in raw_sentences if s.strip()]
        return sentences

    @staticmethod
    def _extract_paragraphs(text: str) -> List[str]:
        """Split text into paragraphs."""
        raw_paras = re.split(r'\n\s*\n', text.strip())
        paras = [p.strip() for p in raw_paras if p.strip()]
        return paras

    def analyze(self, script_text: str) -> Dict[str, Any]:
        cleaned_text = script_text.strip()
        if not cleaned_text:
            return {
                "word_count": 0,
                "sentence_count": 0,
                "paragraph_count": 0,
                "estimated_speaking_duration": 0.0,
                "speaking_rate_wpm": self.baseline_wpm,
                "likely_hooks": [],
                "important_statements": [],
                "candidate_visual_moments": [],
                "candidate_emphasis_words": []
            }

        words = re.findall(r"\b[A-Za-z0-9'-]+\b", cleaned_text)
        word_count = len(words)

        sentences = self._extract_sentences(cleaned_text)
        sentence_count = len(sentences)

        paragraphs = self._extract_paragraphs(cleaned_text)
        paragraph_count = max(1, len(paragraphs))

        # Speaking duration calculation:
        # Base speech time + natural pauses at sentence ends (0.3s) and paragraph breaks (0.5s)
        base_speech_sec = (word_count / self.baseline_wpm) * 60.0
        pause_sec = (sentence_count * 0.3) + (paragraph_count * 0.5)
        estimated_duration = max(3.0, round(base_speech_sec + pause_sec, 1))

        # 1. Likely hooks (first sentence or provocative questions/openers)
        likely_hooks = []
        hook_patterns = [
            r'^(stop|here is|here\'s|how to|why you|did you know|what if|the biggest|most people|never|imagine)\b'
        ]
        if sentences:
            # First sentence is always a primary candidate hook
            likely_hooks.append({
                "text": sentences[0],
                "type": "opening",
                "score": 0.95
            })

            # Check other early sentences (within first 3) for questions or punchy hooks
            for s in sentences[1:3]:
                if s.endswith("?") or any(re.search(pat, s, re.IGNORECASE) for pat in hook_patterns):
                    likely_hooks.append({
                        "text": s,
                        "type": "question" if s.endswith("?") else "pattern_hook",
                        "score": 0.85
                    })

        # 2. Important statements (contrast, revelations, core assertions)
        contrast_terms = ["but", "however", "the reality", "in fact", "the secret", "crucial", "the problem is", "actually", "remember"]
        important_statements = []
        for s_idx, s in enumerate(sentences):
            lower_s = s.lower()
            matched_terms = [t for t in contrast_terms if t in lower_s]
            if matched_terms:
                important_statements.append({
                    "sentence_index": s_idx,
                    "text": s,
                    "reason": f"Contains indicator: {', '.join(matched_terms)}"
                })

        # 3. Candidate visual moments
        candidate_visual_moments = []

        # Statistical / numbers
        stat_regex = re.compile(r'\b(?:\$\d+(?:\.\d+)?(?:k|m|b)?|\d+(?:\.\d+)?%|\d+x|\b\d{2,}\b)', re.IGNORECASE)
        # Comparisons
        comp_regex = re.compile(r'\b(vs|versus|compared to|better than|worse than|instead of|faster than|unlike)\b', re.IGNORECASE)
        # Code / tech
        code_regex = re.compile(r'\b(api|code|function|python|javascript|typescript|docker|git|endpoint|sql|database|react)\b', re.IGNORECASE)
        # Call to Action
        cta_regex = re.compile(r'\b(follow|subscribe|comment|link in bio|check the link|share this|drop a like|try it)\b', re.IGNORECASE)

        for s_idx, s in enumerate(sentences):
            # Check stats
            stat_matches = stat_regex.findall(s)
            if stat_matches:
                candidate_visual_moments.append({
                    "sentence_index": s_idx,
                    "text": s,
                    "type": "statistics",
                    "data": stat_matches,
                    "recommended_scene": "statistics"
                })

            # Check comparison
            comp_matches = comp_regex.findall(s)
            if comp_matches:
                candidate_visual_moments.append({
                    "sentence_index": s_idx,
                    "text": s,
                    "type": "comparison",
                    "data": comp_matches,
                    "recommended_scene": "comparison"
                })

            # Check code
            code_matches = code_regex.findall(s)
            if code_matches:
                candidate_visual_moments.append({
                    "sentence_index": s_idx,
                    "text": s,
                    "type": "code",
                    "data": code_matches,
                    "recommended_scene": "code"
                })

            # Check CTA
            cta_matches = cta_regex.findall(s)
            if cta_matches:
                candidate_visual_moments.append({
                    "sentence_index": s_idx,
                    "text": s,
                    "type": "cta",
                    "data": cta_matches,
                    "recommended_scene": "cta"
                })

        # 4. Candidate emphasis words (uppercase words or high-impact words)
        emphasis_keywords = {
            "massive", "secret", "never", "always", "proven", "insane", "crucial",
            "game-changer", "revolutionary", "worst", "best", "warning", "deadly",
            "essential", "unbelievable", "shocking", "fastest", "critical", "hidden"
        }
        emphasis_words_set = set()

        for w in words:
            # UPPERCASE words of length >= 3 (excluding common acronyms like AI or UI if preferred)
            if w.isupper() and len(w) >= 3 and w not in {"THE", "AND", "FOR", "ARE", "BUT", "NOT"}:
                emphasis_words_set.add(w)
            elif w.lower() in emphasis_keywords:
                emphasis_words_set.add(w.upper())

        candidate_emphasis_words = sorted(list(emphasis_words_set))

        return {
            "word_count": word_count,
            "sentence_count": sentence_count,
            "paragraph_count": paragraph_count,
            "estimated_speaking_duration": estimated_duration,
            "speaking_rate_wpm": self.baseline_wpm,
            "likely_hooks": likely_hooks,
            "important_statements": important_statements,
            "candidate_visual_moments": candidate_visual_moments,
            "candidate_emphasis_words": candidate_emphasis_words
        }

class ScriptAnalyzer:
    """Orchestrator that wraps the active script analyzer implementation."""
    def __init__(self, analyzer: Optional[BaseScriptAnalyzer] = None):
        self._analyzer = analyzer or RuleBasedScriptAnalyzer()

    def analyze(self, script_text: str) -> Dict[str, Any]:
        return self._analyzer.analyze(script_text)

script_analyzer = ScriptAnalyzer()
