'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Project } from '@miraaj/shared';
import { fetchProject } from '../../../lib/api';
import { ProjectDetails } from '../../../components/ProjectDetails';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetchProject(projectId)
      .then((data) => {
        setProject(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load project');
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    // Poll every 3 seconds if project is in 'processing' state
    const interval = setInterval(() => {
      if (project?.status === 'processing') {
        load();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [projectId, project?.status]);

  if (isLoading) {
    return (
      <div className="py-24 text-center font-mono text-xs text-gray-500">
        Loading project {projectId}...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm max-w-xl mx-auto text-center space-y-4">
        <p className="font-bold text-base">Project Not Found</p>
        <p className="text-xs font-mono text-rose-400">{error || 'Could not find project record'}</p>
        <Link
          href="/projects"
          className="inline-block px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
        >
          ← Return to Projects
        </Link>
      </div>
    );
  }

  return <ProjectDetails project={project} onRefresh={load} />;
}
