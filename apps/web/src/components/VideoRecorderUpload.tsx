'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface VideoMeta {
  duration: number;
  width: number;
  height: number;
  fileSize: number;
  name: string;
}

interface Props {
  onVideoSelected: (file: File | null, meta?: VideoMeta | null) => void;
}

export const VideoRecorderUpload: React.FC<Props> = ({ onVideoSelected }) => {
  const [tab, setTab] = useState<'upload' | 'record'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);

  // Recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoLiveRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const extractMeta = (file: File) => {
    const url = URL.createObjectURL(file);
    const tempVid = document.createElement('video');
    tempVid.preload = 'metadata';
    tempVid.src = url;
    tempVid.onloadedmetadata = () => {
      const meta: VideoMeta = {
        duration: Math.round(tempVid.duration * 10) / 10,
        width: tempVid.videoWidth || 1080,
        height: tempVid.videoHeight || 1920,
        fileSize: file.size,
        name: file.name
      };
      setVideoMeta(meta);
      onVideoSelected(file, meta);
      URL.revokeObjectURL(url);
    };
    tempVid.onerror = () => {
      const fallbackMeta: VideoMeta = {
        duration: 0,
        width: 1080,
        height: 1920,
        fileSize: file.size,
        name: file.name
      };
      setVideoMeta(fallbackMeta);
      onVideoSelected(file, fallbackMeta);
    };
  };

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      extractMeta(file);
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1080 }, height: { ideal: 1920 }, facingMode: 'user' },
        audio: true,
      });
      mediaStreamRef.current = stream;
      if (videoLiveRef.current) {
        videoLiveRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err: any) {
      setCameraError(err.message || 'Could not access webcam. Please verify permissions.');
      setCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Start Recording
  const startRecording = () => {
    if (!mediaStreamRef.current) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(mediaStreamRef.current, {
      mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm',
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      const file = new File([blob], 'webcam_recording.webm', { type: 'video/webm' });
      setSelectedFile(file);
      extractMeta(file);
      stopCamera();
    };

    mediaRecorderRef.current = recorder;
    recorder.start(250);
    setIsRecording(true);
    setRecordingSeconds(0);

    timerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-[#111625] border border-white/10 rounded-3xl p-6 shadow-xl">
      {/* Tab Switcher */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <span>🎥</span> Talking-Head Footage
          </h3>
          <p className="text-xs text-gray-400">
            Upload your recorded 9:16 vertical video or record live with your webcam
          </p>
        </div>

        <div className="flex bg-black/40 border border-white/10 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setTab('upload');
              stopCamera();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'upload' ? 'bg-yellow-400 text-black shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('record');
              startCamera();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === 'record' ? 'bg-yellow-400 text-black shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Record Live
          </button>
        </div>
      </div>

      {/* Upload Mode */}
      {tab === 'upload' && (
        <div>
          {previewUrl ? (
            <div className="relative aspect-[9/16] max-h-[380px] mx-auto rounded-2xl overflow-hidden border border-white/20 bg-black">
              <video src={previewUrl} controls className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setVideoMeta(null);
                  onVideoSelected(null, null);
                }}
                className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-black/80 text-white text-xs font-bold hover:bg-rose-600 transition-colors"
              >
                Change
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-white/15 hover:border-yellow-400/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/[0.02]">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center text-2xl text-yellow-400 mb-3">
                📁
              </div>
              <p className="font-semibold text-white text-sm">Click or Drag & Drop Video</p>
              <p className="text-xs text-gray-500 mt-1">MP4, WebM, MOV (9:16 vertical recommended)</p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}

      {/* Live Record Mode */}
      {tab === 'record' && (
        <div>
          {cameraError ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              {cameraError}
            </div>
          ) : previewUrl && !cameraActive ? (
            <div className="relative aspect-[9/16] max-h-[380px] mx-auto rounded-2xl overflow-hidden border border-white/20 bg-black">
              <video src={previewUrl} controls className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setVideoMeta(null);
                  onVideoSelected(null, null);
                  startCamera();
                }}
                className="absolute top-3 right-3 px-3 py-1 rounded-lg bg-black/80 text-white text-xs font-bold hover:bg-yellow-500 hover:text-black transition-colors"
              >
                Retake Recording
              </button>
            </div>
          ) : (
            <div className="relative aspect-[9/16] max-h-[380px] mx-auto rounded-2xl overflow-hidden border border-white/20 bg-black">
              <video
                ref={videoLiveRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover -scale-x-100"
              />

              {/* Recording Overlay Info */}
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-rose-500/40 text-xs text-rose-400 font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  REC {Math.floor(recordingSeconds / 60)}:
                  {String(recordingSeconds % 60).padStart(2, '0')}
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-4 inset-x-0 flex justify-center">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/40 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span className="w-3 h-3 rounded-full bg-white" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-sm shadow-lg flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <span className="w-3 h-3 rounded-sm bg-rose-600" />
                    Finish & Use
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {selectedFile && (
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400 bg-black/40 px-3 py-2 rounded-xl border border-white/5 font-mono">
          <span className="truncate max-w-[200px]">{selectedFile.name}</span>
          <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
        </div>
      )}
    </div>
  );
};
