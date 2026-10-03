'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { HealthStatus } from '@miraaj/shared';
import { fetchHealth } from '../lib/api';

export const Navbar: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [showHealthModal, setShowHealthModal] = useState(false);

  useEffect(() => {
    const check = () => {
      fetchHealth()
        .then(setHealth)
        .catch(() => setHealth(null));
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = health?.status === 'healthy';
  const isDegraded = health?.status === 'degraded';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#07090E]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-cyan-400 p-[2px] shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#07090E] rounded-[10px] flex items-center justify-center font-black text-amber-400 text-lg">
                M
              </div>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1.5">
                MIRAAJ
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 font-mono border border-yellow-400/20">
                  V1
                </span>
              </span>
              <p className="text-[11px] text-gray-400 tracking-wider uppercase font-medium">
                AI Short-Form Video Pipeline
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-6 text-sm font-medium">
            <Link
              href="/projects"
              className="px-3 py-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Projects
            </Link>
            <Link
              href="/projects/new"
              className="px-3 py-1.5 rounded-lg text-yellow-400 hover:bg-yellow-400/10 transition-colors font-semibold"
            >
              + New Video
            </Link>
          </nav>
        </div>

        {/* Right side: System Health Badge & Action */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => setShowHealthModal(!showHealthModal)}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isHealthy
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : isDegraded
                  ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                  : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              }`}
            />
            <span className="text-gray-300 font-mono capitalize">
              {health?.status || 'connecting...'}
            </span>
          </div>

          <Link
            href="/projects/new"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm shadow-lg shadow-yellow-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            Create Project
          </Link>
        </div>
      </div>

      {/* Health Popup Modal */}
      {showHealthModal && health && (
        <div className="absolute right-6 top-20 w-80 bg-[#111625] border border-white/10 rounded-2xl shadow-2xl p-5 z-50 text-xs">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-bold text-white text-sm">System Subsystems</h4>
            <button
              onClick={() => setShowHealthModal(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-gray-300">Database</span>
              <span className="font-mono text-emerald-400 uppercase font-semibold">
                {health.services.database?.type || 'Connected'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-gray-300">Redis Queue</span>
              <span
                className={`font-mono uppercase font-semibold ${
                  health.services.redis?.status === 'connected' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {health.services.redis?.status || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-gray-300">FFmpeg</span>
              <span
                className={`font-mono uppercase font-semibold ${
                  health.services.ffmpeg?.available ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {health.services.ffmpeg?.available ? 'Available' : 'Missing'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-black/40 border border-white/5">
              <span className="text-gray-300">Storage Provider</span>
              <span className="font-mono text-cyan-400 uppercase font-semibold">
                {health.services.storage?.provider || 'Local'}
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
