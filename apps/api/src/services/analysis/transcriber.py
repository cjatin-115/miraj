import os
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class TranscriberService:
    def __init__(self, model_size: str = "tiny", device: str = "cpu", compute_type: str = "int8"):
        self.model_size = model_size
        self.device = device
        self.compute_type = compute_type
        self._faster_model = None
        self._openai_model = None

    def _get_faster_model(self):
        if self._faster_model is None:
            from faster_whisper import WhisperModel
            self._faster_model = WhisperModel(
                self.model_size,
                device=self.device,
                compute_type=self.compute_type
            )
        return self._faster_model

    def _get_openai_model(self):
        if self._openai_model is None:
            import whisper
            logger.info(f"Loading PyTorch Whisper model ({self.model_size})...")
            self._openai_model = whisper.load_model(self.model_size, device=self.device)
            logger.info("PyTorch Whisper model loaded successfully.")
        return self._openai_model

    def transcribe(self, audio_path: Optional[Path], language: Optional[str] = "en") -> Dict[str, Any]:
        """
        Transcribe an audio file (e.g. 16kHz WAV) and generate word-level timestamps.
        Tries faster-whisper first, then falls back to openai-whisper.
        """
        if not audio_path or not Path(audio_path).exists() or Path(audio_path).stat().st_size <= 44:
            logger.warning("No valid audio file provided for transcription.")
            return {
                "text": "",
                "language": language or "en",
                "duration": 0.0,
                "speech_detected": False,
                "words": [],
                "segments": []
            }

        # 1. Try faster-whisper
        try:
            model = self._get_faster_model()
            segments_gen, info = model.transcribe(
                str(audio_path),
                word_timestamps=True,
                language=language if language and language != "auto" else None,
                vad_filter=True
            )

            all_words: List[Dict[str, Any]] = []
            segment_list: List[Dict[str, Any]] = []
            full_text_parts: List[str] = []

            for seg_idx, seg in enumerate(segments_gen):
                seg_words = []
                if seg.words:
                    for w in seg.words:
                        cleaned = w.word.strip()
                        if cleaned:
                            word_item = {
                                "word": cleaned,
                                "start": round(w.start, 2),
                                "end": round(w.end, 2),
                                "probability": round(getattr(w, "probability", 1.0), 3)
                            }
                            all_words.append(word_item)
                            seg_words.append(word_item)

                cleaned_seg_text = seg.text.strip()
                if cleaned_seg_text:
                    full_text_parts.append(cleaned_seg_text)

                segment_list.append({
                    "id": seg_idx,
                    "start": round(seg.start, 2),
                    "end": round(seg.end, 2),
                    "text": cleaned_seg_text,
                    "words": seg_words
                })

            full_text = " ".join(full_text_parts)
            duration = round(info.duration, 2) if hasattr(info, "duration") else 0.0
            detected_lang = getattr(info, "language", language or "en")

            return {
                "text": full_text,
                "language": detected_lang,
                "duration": duration,
                "speech_detected": len(all_words) > 0,
                "words": all_words,
                "segments": segment_list,
                "engine": "faster-whisper"
            }
        except Exception as e:
            logger.warning(f"faster-whisper failed ({e}), falling back to PyTorch Whisper...")

        # 2. Fallback to openai-whisper
        try:
            model = self._get_openai_model()
            result = model.transcribe(
                str(audio_path),
                language=language if language and language != "auto" else None,
                word_timestamps=True
            )

            all_words: List[Dict[str, Any]] = []
            segment_list: List[Dict[str, Any]] = []
            full_text = result.get("text", "").strip()

            for seg_idx, seg in enumerate(result.get("segments", [])):
                seg_words = []
                for w in seg.get("words", []):
                    cleaned = w.get("word", "").strip()
                    if cleaned:
                        word_item = {
                            "word": cleaned,
                            "start": round(w.get("start", 0.0), 2),
                            "end": round(w.get("end", 0.0), 2),
                            "probability": round(w.get("probability", 1.0), 3)
                        }
                        all_words.append(word_item)
                        seg_words.append(word_item)

                segment_list.append({
                    "id": seg_idx,
                    "start": round(seg.get("start", 0.0), 2),
                    "end": round(seg.get("end", 0.0), 2),
                    "text": seg.get("text", "").strip(),
                    "words": seg_words
                })

            return {
                "text": full_text,
                "language": result.get("language", language or "en"),
                "duration": round(segment_list[-1]["end"], 2) if segment_list else 0.0,
                "speech_detected": len(all_words) > 0 or len(full_text) > 0,
                "words": all_words,
                "segments": segment_list,
                "engine": "openai-whisper"
            }
        except Exception as err:
            logger.error(f"Both transcription engines failed: {err}", exc_info=True)
            return {
                "text": "",
                "language": language or "en",
                "duration": 0.0,
                "speech_detected": False,
                "words": [],
                "segments": [],
                "error": str(err)
            }

transcriber = TranscriberService()
