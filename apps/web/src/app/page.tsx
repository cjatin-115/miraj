import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="py-12 space-y-20">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-400/20 bg-yellow-400/5 text-yellow-400 text-xs font-mono font-semibold">
          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          V1 Complete Pipeline Architecture
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          Talking Head In.{' '}
          <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-cyan-400 bg-clip-text text-transparent">
            Polished Short-Form
          </span>{' '}
          Out.
        </h1>

        <p className="text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
          Miraaj takes an ordinary webcam recording and script and transforms it into a polished vertical video inspired by modern creator visual languages.
        </p>

        <div className="p-4 rounded-2xl bg-[#111625]/80 border border-white/10 max-w-xl mx-auto text-xs font-mono text-gray-300">
          <span className="text-yellow-400 font-bold">CORE ARCHITECTURE:</span> AI determines WHAT should happen. Deterministic rendering code determines HOW it looks.
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/projects/new"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-extrabold text-base shadow-xl shadow-yellow-500/25 active:scale-95 transition-all"
          >
            Create New Project ➔
          </Link>
          <Link
            href="/projects"
            className="px-6 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all"
          >
            View Projects
          </Link>
        </div>
      </section>

      {/* Pipeline Diagram */}
      <section className="bg-[#111625] border border-white/10 rounded-3xl p-8 shadow-2xl">
        <h2 className="text-xs font-mono uppercase text-gray-400 font-bold tracking-wider mb-6 text-center">
          The Automated Video Production Pipeline
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs font-mono">
          {[
            { step: '01', title: 'Script + Video', desc: 'Ingestion' },
            { step: '02', title: 'Analysis', desc: 'Timing & Keywords' },
            { step: '03', title: 'AI Director', desc: 'Edit Plan JSON' },
            { step: '04', title: 'Timeline', desc: 'Deterministic Spec' },
            { step: '05', title: 'Remotion', desc: 'React Scene Render' },
            { step: '06', title: 'FFmpeg', desc: 'Encoding & Mux' },
            { step: '07', title: 'Final MP4', desc: '1080x1920 (9:16)' },
          ].map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center hover:border-yellow-400/30 transition-colors"
            >
              <span className="text-[10px] text-yellow-400 font-bold mb-1">{item.step}</span>
              <strong className="text-white text-xs">{item.title}</strong>
              <span className="text-[11px] text-gray-400 mt-1">{item.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-[#111625] border border-white/10 space-y-3">
          <div className="text-3xl">🎯</div>
          <h3 className="font-bold text-white text-lg">Talking-Head Anchor</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Maintains the creator as the visual anchor while executing intelligent reframing, punch-in zooms, and background blur treatment.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111625] border border-white/10 space-y-3">
          <div className="text-3xl">✨</div>
          <h3 className="font-bold text-white text-lg">Editorial Style System</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            `modern_creator_v1` configuration dictates font sizes, safe areas, neon accents, high-contrast keyword chips, and fast transitions.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#111625] border border-white/10 space-y-3">
          <div className="text-3xl">🔒</div>
          <h3 className="font-bold text-white text-lg">Local-First & Scalable</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Works 100% locally with filesystem storage, local Redis & PostgreSQL / SQLite support, and zero paid API dependencies required.
          </p>
        </div>
      </section>
    </div>
  );
}
