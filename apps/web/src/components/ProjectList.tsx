'use client';

import React from 'react';
import Link from 'next/link';
import { Project } from '@miraaj/shared';

interface Props {
  projects: Project[];
}

export const ProjectList: React.FC<Props> = ({ projects }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-20 bg-[#111625]/60 border border-white/10 rounded-3xl p-8">
        <div className="w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 text-3xl mx-auto flex items-center justify-center mb-4">
          🎬
        </div>
        <h3 className="font-extrabold text-white text-xl">No Video Projects Yet</h3>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">
          Create your first short-form video by uploading a webcam recording and your script.
        </p>
        <Link
          href="/projects/new"
          className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold text-sm shadow-lg shadow-yellow-500/20 hover:brightness-110 transition-all"
        >
          Create First Video
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const hasVideo = !!project.source_video;
        const wordCount = project.script?.word_count || 0;
        const estSec = project.script?.estimated_duration_seconds || 0;

        return (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="group bg-[#111625] border border-white/10 hover:border-yellow-400/40 rounded-3xl p-6 shadow-xl hover:shadow-yellow-400/10 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-full border border-white/10 bg-black/40 text-gray-300">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
                <span
                  className={`text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-full ${
                    project.status === 'ready'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : project.status === 'processing'
                      ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 animate-pulse'
                      : 'bg-white/5 text-gray-300 border border-white/10'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-extrabold text-white text-lg group-hover:text-yellow-400 transition-colors line-clamp-2 mb-2">
                {project.title}
              </h3>

              {/* Script snippet */}
              <p className="text-xs text-gray-400 line-clamp-3 font-mono leading-relaxed mb-6">
                {project.script?.raw_text || 'No script text.'}
              </p>
            </div>

            {/* Footer metrics */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span>📹</span> {hasVideo ? 'Footage Ingested' : 'Script Only'}
              </span>
              <span className="text-yellow-400 font-semibold">{wordCount}w (~{estSec}s)</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};
