import os
import cv2
import numpy as np
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class VideoAnalyzer:
    def __init__(self):
        # Locate OpenCV's built-in Haar Cascade for frontal face detection
        cascade_path = os.path.join(cv2.data.haarcascades, "haarcascade_frontalface_default.xml")
        if not os.path.exists(cascade_path):
            raise RuntimeError(f"OpenCV face cascade not found at {cascade_path}")
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

    @staticmethod
    def _classify_framing(face_h_norm: float) -> str:
        """Classify camera shot framing based on normalized face height relative to frame height."""
        if face_h_norm > 0.40:
            return "close_up"
        elif face_h_norm >= 0.26:
            return "medium_close_up"
        elif face_h_norm >= 0.14:
            return "medium"
        elif face_h_norm > 0:
            return "wide"
        return "none"

    def analyze(self, video_path: Path, sample_fps: float = 2.0) -> Dict[str, Any]:
        """
        Analyze talking-head video for face position, framing, movement, camera stability,
        scene changes, and usable segments.
        """
        if not video_path.exists():
            raise FileNotFoundError(f"Video file not found: {video_path}")

        cap = cv2.VideoCapture(str(video_path))
        if not cap.isOpened():
            raise ValueError(f"Could not open video file: {video_path}")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
        duration = total_frames / fps if fps > 0 else 0.0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1)
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 1)

        # Sample every N frames based on desired sample_fps
        frame_interval = max(1, int(fps / sample_fps))

        sampled_faces = []
        motion_deltas = []
        scene_cuts = []
        prev_gray = None
        frame_idx = 0

        framing_counts = {
            "close_up": 0,
            "medium_close_up": 0,
            "medium": 0,
            "wide": 0,
            "none": 0
        }

        total_sampled = 0

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % frame_interval == 0:
                total_sampled += 1
                timestamp = round(frame_idx / fps, 2)
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

                # Motion detection & scene cuts
                if prev_gray is not None and prev_gray.shape == gray.shape:
                    diff = cv2.absdiff(prev_gray, gray)
                    motion_val = float(np.mean(diff))
                    motion_deltas.append(motion_val)

                    # Sudden huge difference indicates a hard cut or scene change
                    if motion_val > 45.0:
                        scene_cuts.append(timestamp)

                prev_gray = gray

                # Face detection
                # Haar cascade works well on downscaled 540p frames
                detected_faces = self.face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.15,
                    minNeighbors=4,
                    minSize=(int(width * 0.08), int(height * 0.08))
                )

                if len(detected_faces) > 0:
                    # Select the largest face by area (closest talking-head subject)
                    largest_face = max(detected_faces, key=lambda f: f[2] * f[3])
                    x, y, w, h = largest_face

                    norm_x = round(float(x) / width, 4)
                    norm_y = round(float(y) / height, 4)
                    norm_w = round(float(w) / width, 4)
                    norm_h = round(float(h) / height, 4)
                    center_x = round(norm_x + norm_w / 2.0, 4)
                    center_y = round(norm_y + norm_h / 2.0, 4)
                    offset_x = round(center_x - 0.5, 4)
                    offset_y = round(center_y - 0.5, 4)

                    framing = self._classify_framing(norm_h)
                    framing_counts[framing] += 1

                    sampled_faces.append({
                        "timestamp": timestamp,
                        "bbox": [norm_x, norm_y, norm_w, norm_h],
                        "center": [center_x, center_y],
                        "offset": [offset_x, offset_y],
                        "framing": framing,
                        "is_centered": abs(offset_x) <= 0.12
                    })
                else:
                    framing_counts["none"] += 1

            frame_idx += 1

        cap.release()

        # Aggregate metrics
        face_detected_ratio = round(len(sampled_faces) / max(1, total_sampled), 3)

        # Average face metrics
        if sampled_faces:
            avg_center_x = round(sum(f["center"][0] for f in sampled_faces) / len(sampled_faces), 3)
            avg_center_y = round(sum(f["center"][1] for f in sampled_faces) / len(sampled_faces), 3)
            avg_w = round(sum(f["bbox"][2] for f in sampled_faces) / len(sampled_faces), 3)
            avg_h = round(sum(f["bbox"][3] for f in sampled_faces) / len(sampled_faces), 3)
            avg_offset_x = round(avg_center_x - 0.5, 3)
            avg_offset_y = round(avg_center_y - 0.5, 3)
            dominant_framing = max(
                (k for k in framing_counts if k != "none"),
                key=lambda k: framing_counts[k],
                default="medium"
            )
            is_mostly_centered = abs(avg_offset_x) <= 0.12
        else:
            avg_center_x = 0.5
            avg_center_y = 0.4
            avg_w = 0.35
            avg_h = 0.35
            avg_offset_x = 0.0
            avg_offset_y = 0.0
            dominant_framing = "medium"
            is_mostly_centered = True

        # Camera stability (0.0 shaky to 1.0 rock-solid)
        if motion_deltas:
            mean_motion = float(np.mean(motion_deltas))
            std_motion = float(np.std(motion_deltas))
            # Stability score: smooth motion yields higher score
            stability = round(max(0.1, min(1.0, 1.0 / (1.0 + (mean_motion * 0.08) + (std_motion * 0.04)))), 2)
        else:
            mean_motion = 0.0
            stability = 0.95

        # Usable segments (segments with face present and stable motion)
        usable_segments = []
        if sampled_faces:
            seg_start = sampled_faces[0]["timestamp"]
            prev_t = seg_start
            for f in sampled_faces[1:]:
                if f["timestamp"] - prev_t > (frame_interval / fps) * 2.5:
                    usable_segments.append({"start": seg_start, "end": prev_t, "framing": dominant_framing})
                    seg_start = f["timestamp"]
                prev_t = f["timestamp"]
            usable_segments.append({"start": seg_start, "end": prev_t, "framing": dominant_framing})
        elif duration > 0:
            usable_segments.append({"start": 0.0, "end": duration, "framing": "medium"})

        return {
            "duration": round(duration, 2),
            "total_sampled_frames": total_sampled,
            "face_detected_ratio": face_detected_ratio,
            "dominant_framing": dominant_framing,
            "is_centered": is_mostly_centered,
            "average_face_center": [avg_center_x, avg_center_y],
            "average_face_bbox": [round(avg_center_x - avg_w/2, 3), round(avg_center_y - avg_h/2, 3), avg_w, avg_h],
            "offset_from_center": [avg_offset_x, avg_offset_y],
            "camera_stability": stability,
            "mean_motion_delta": round(mean_motion, 2),
            "scene_cuts": sorted(list(set(scene_cuts))),
            "usable_segments": usable_segments,
            "framing_distribution": framing_counts
        }

video_analyzer = VideoAnalyzer()
