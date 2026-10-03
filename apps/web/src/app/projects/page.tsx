'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Project } from '@miraaj/shared';
import { fetchProjects } from '../../lib/api';
import { ProjectList } from '../../components/ProjectList';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    fetchProjects()
      .then((data) => {
        setProjects(data.projects || []);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to connect to API backend');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Video Projects</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your talking-head footage, scripts, and generated timelines
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all"
          >
            ↻ Refresh
          </button>
          <Link
            href="/projects/new"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-extrabold text-xs shadow-lg shadow-yellow-500/20 hover:brightness-110 active:scale-95 transition-all"
          >
            + Create Video
          </Link>
        </div>
      </div>

      {error ? (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
          <p className="font-bold mb-1">Backend Connection Error</p>
          <p className="text-xs font-mono">{error}</p>
          <button
            onClick={load}
            className="mt-4 px-4 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold"
          >
            Retry Connection
          </button>
        </div>
      ) : isLoading ? (
        <div className="py-20 text-center text-gray-500 font-mono text-xs">
          Loading projects from Miraaj API...
        </div>
      ) : (
        <ProjectList projects={projects} />
      )}
    </div>
  );
}
