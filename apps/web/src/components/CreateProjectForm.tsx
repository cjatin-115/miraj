'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VideoRecorderUpload, VideoMeta } from './VideoRecorderUpload';
import {
  createProject,
  triggerPipeline,
  estimateDuration,
  validateDuration,
  DurationEstimate,
  DurationValidation,
} from '../lib/api';

export const CreateProjectForm: React.FC = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [scriptText, setScriptText] = useState(
    'Miraaj turns your ordinary talking-head video into a high-impact short-form edit.\n\nTraditional editing takes hours, but our pipeline automates 90% of the cuts, framing, and keyword emphasis.\n\nAI determines WHAT happens. Deterministic code determines HOW it looks.\n\nFollow and subscribe for more modern creator workflows!'
  );
  const [styleId, setStyleId] = useState('modern_creator_v1');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);

  // Duration Intelligence state
  const [durationEstimate, setDurationEstimate] = useState<DurationEstimate | null>(null);
  const [targetDurationMode, setTargetDurationMode] = useState<'recommended' | '45' | '60' | '70' | 'custom'>('recommended');
  const [customDuration, setCustomDuration] = useState<string>('60');
  const [durationValidation, setDurationValidation] = useState<DurationValidation | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Script basic stats
  const scriptStats = useMemo(() => {
    const trimmed = scriptText.trim();
    if (!trimmed) {
      return { words: 0, sentences: 0, paragraphs: 0, wpm: 150 };
    }
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    return {
      words,
      sentences: Math.max(1, sentences),
      paragraphs: Math.max(1, paragraphs),
      wpm: 150,
    };
  }, [scriptText]);

  // Determine actual target duration number
  const selectedTargetDuration = useMemo(() => {
    if (targetDurationMode === 'recommended') {
      return durationEstimate?.recommended_duration || 60;
    }
    if (targetDurationMode === '45') return 45;
    if (targetDurationMode === '60') return 60;
    if (targetDurationMode === '70') return 70;
    const parsed = parseInt(customDuration, 10);
    return isNaN(parsed) || parsed < 5 ? 60 : parsed;
  }, [targetDurationMode, customDuration, durationEstimate]);

  // Recalculate duration intelligence when script or video changes
  const runDurationEstimation = useCallback(async () => {
    if (!scriptText.trim()) {
      setDurationEstimate(null);
      setDurationValidation(null);
      return;
    }

    try {
      const est = await estimateDuration(scriptText, videoMeta?.duration);
      setDurationEstimate(est);

      // Validate target duration against current estimate
      const val = await validateDuration({
        target_duration: selectedTargetDuration,
        estimated_min_duration: est.estimated_min_duration,
        estimated_max_duration: est.estimated_max_duration,
        recommended_duration: est.recommended_duration,
        script_text: scriptText,
      });
      setDurationValidation(val);
    } catch (e) {
      console.warn('Could not estimate duration:', e);
    }
  }, [scriptText, videoMeta?.duration, selectedTargetDuration]);

  useEffect(() => {
    const timer = setTimeout(() => {
      runDurationEstimation();
    }, 300);
    return () => clearTimeout(timer);
  }, [runDurationEstimation]);

  const handleVideoSelected = (file: File | null, meta?: VideoMeta | null) => {
    setVideoFile(file);
    setVideoMeta(meta || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptText.trim()) {
      setErrorMessage('Please provide a script for your video.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('script_text', scriptText);
      if (title.trim()) {
        formData.append('title', title.trim());
      }
      formData.append('style_id', styleId);
      if (videoFile) {
        formData.append('video', videoFile);
      }

      const created = await createProject(formData);
      try {
        await triggerPipeline(created.id, selectedTargetDuration);
      } catch (pipeErr) {
        console.warn('Pipeline will be initiated from project dashboard:', pipeErr);
      }
      router.push(`/projects/${created.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create project. Please check backend connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
          <span>{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-gray-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Script & Duration Intelligence */}
        <div className="lg:col-span-7 space-y-6">
          {/* Title Input */}
          <div className="bg-[#111625] border border-white/10 rounded-3xl p-6 shadow-xl space-y-2">
            <label className="block text-sm font-bold text-white">Project Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 3 Secrets to Deterministic Short-Form Video"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-yellow-400 transition-colors"
            />
          </div>

          {/* Script Input Card */}
          <div className="bg-[#111625] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-bold text-white">Script Content</label>
                <p className="text-xs text-gray-400">
                  The spoken narrative used by the AI Director to identify keywords and pace scenes
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-yellow-400 font-semibold">
                  {scriptStats.words} words
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-cyan-400 font-semibold">
                  {scriptStats.sentences} sentences
                </span>
              </div>
            </div>

            <textarea
              rows={8}
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Paste or write your short-form video script here..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white text-sm leading-relaxed focus:outline-none focus:border-yellow-400 transition-colors resize-y font-mono"
            />

            {/* Style Selector */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400">Visual Style Preset</span>
              <select
                value={styleId}
                onChange={(e) => setStyleId(e.target.value)}
                className="bg-black/60 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-yellow-400 font-semibold focus:outline-none"
              >
                <option value="modern_creator_v1">Modern Creator V1 (9:16)</option>
              </select>
            </div>
          </div>

          {/* Duration Intelligence Card */}
          {durationEstimate && (
            <div className="bg-[#111625] border border-yellow-500/20 rounded-3xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <span>⏱️</span> Duration Intelligence
                  </h3>
                  <p className="text-xs text-gray-400">
                    Calculated from speech cadence, sentence boundaries, and footage pacing
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">
                  Confidence: {Math.round(durationEstimate.confidence * 100)}%
                </span>
              </div>

              {/* Estimate Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[11px] font-mono uppercase text-gray-400">Estimated Length</span>
                  <div className="text-xl font-extrabold text-white">
                    {durationEstimate.estimated_min_duration}–{durationEstimate.estimated_max_duration}s
                  </div>
                  <span className="text-[10px] text-gray-500">Natural speaking range</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-yellow-400/30 bg-yellow-400/[0.02] space-y-1">
                  <span className="text-[11px] font-mono uppercase text-yellow-400 font-bold">Recommended</span>
                  <div className="text-xl font-extrabold text-yellow-400">
                    {durationEstimate.recommended_duration} seconds
                  </div>
                  <span className="text-[10px] text-gray-400">Balanced creator pacing</span>
                </div>

                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-mono uppercase text-gray-400">Cadence</span>
                  <div className="text-xl font-extrabold text-cyan-400">
                    ~{Math.round(durationEstimate.speaking_rate_wpm)} WPM
                  </div>
                  <span className="text-[10px] text-gray-500">~2.5 words/second</span>
                </div>
              </div>

              {/* Target Duration Selector */}
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Target Duration Selector
                  </label>
                  <span className="text-xs font-mono text-gray-400">
                    Selected: <strong className="text-white">{selectedTargetDuration}s</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetDurationMode('recommended')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      targetDurationMode === 'recommended'
                        ? 'bg-yellow-400 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                        : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    Recommended ({durationEstimate.recommended_duration}s)
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetDurationMode('45')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      targetDurationMode === '45'
                        ? 'bg-yellow-400 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                        : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    45 sec
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetDurationMode('60')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      targetDurationMode === '60'
                        ? 'bg-yellow-400 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                        : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    60 sec
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetDurationMode('70')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      targetDurationMode === '70'
                        ? 'bg-yellow-400 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                        : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    70 sec
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetDurationMode('custom')}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      targetDurationMode === 'custom'
                        ? 'bg-yellow-400 text-black border-yellow-400 shadow-md shadow-yellow-500/20'
                        : 'bg-black/40 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {/* Custom duration numeric input */}
                {targetDurationMode === 'custom' && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/50 border border-white/10">
                    <span className="text-xs text-gray-400 font-mono">Custom Target (seconds):</span>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      className="w-24 bg-black/60 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-yellow-400 font-bold focus:outline-none focus:border-yellow-400"
                    />
                    <span className="text-xs text-gray-500">seconds</span>
                  </div>
                )}

                {/* Duration Validation Warning */}
                {durationValidation && !durationValidation.is_valid && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-base leading-none">⚠️</span>
                      <div>
                        <strong className="block text-amber-300 font-bold mb-0.5">
                          {durationValidation.warning}
                        </strong>
                        <p className="text-amber-200/90 leading-relaxed">
                          {durationValidation.message}
                        </p>
                      </div>
                    </div>

                    {durationValidation.can_expand && (
                      <div className="pt-2 border-t border-amber-500/20 flex items-center justify-between">
                        <span className="text-[11px] text-amber-300/80">
                          Architecture ready for script expansion
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/30 cursor-not-allowed">
                          🤖 Expand script to target duration (Future Feature)
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Footage Upload & Video Info */}
        <div className="lg:col-span-5 space-y-6">
          <VideoRecorderUpload onVideoSelected={handleVideoSelected} />

          {/* Video Information Card */}
          {videoMeta && (
            <div className="bg-[#111625] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-mono uppercase text-gray-400 font-bold tracking-wider flex items-center gap-2">
                <span>📹</span> Detected Video Information
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-gray-500 block text-[10px]">Dimensions</span>
                  <span className="text-white font-bold">{videoMeta.width} x {videoMeta.height}</span>
                  <span className="text-emerald-400 text-[10px] block mt-0.5">
                    {videoMeta.width < videoMeta.height ? '9:16 Vertical Anchor' : 'Horizontal (will be cropped/framed)'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-gray-500 block text-[10px]">Duration</span>
                  <span className="text-yellow-400 font-bold">{videoMeta.duration}s</span>
                  <span className="text-gray-400 text-[10px] block mt-0.5">
                    {Math.round(videoMeta.duration * 30)} frames @ 30fps
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-gray-500 block text-[10px]">File Size</span>
                  <span className="text-white font-bold">{(videoMeta.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                  <span className="text-gray-500 text-[10px] block mt-0.5 truncate">{videoMeta.name}</span>
                </div>

                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-gray-500 block text-[10px]">Audio Track</span>
                  <span className="text-cyan-400 font-bold">Active Audio</span>
                  <span className="text-gray-500 text-[10px] block mt-0.5">Ready for Whisper transcription</span>
                </div>
              </div>
            </div>
          )}

          {/* Script Statistics Card */}
          <div className="bg-[#111625] border border-white/10 rounded-3xl p-6 shadow-xl space-y-3">
            <h4 className="text-xs font-mono uppercase text-gray-400 font-bold tracking-wider flex items-center gap-2">
              <span>📊</span> Script Statistics
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-500 block text-[10px]">Words</span>
                <span className="text-white font-extrabold text-sm">{scriptStats.words}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-500 block text-[10px]">Sentences</span>
                <span className="text-white font-extrabold text-sm">{scriptStats.sentences}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                <span className="text-gray-500 block text-[10px]">Paragraphs</span>
                <span className="text-white font-extrabold text-sm">{scriptStats.paragraphs}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Action Bar */}
      <div className="flex justify-end items-center gap-4 pt-6 border-t border-white/10">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-amber-500 hover:brightness-110 text-black font-extrabold text-base shadow-xl shadow-yellow-500/25 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
        >
          {isSubmitting ? (
            <>
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Creating & Running Pipeline...</span>
            </>
          ) : (
            <>
              <span>🎬 CREATE VIDEO</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
