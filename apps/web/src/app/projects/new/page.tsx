'use client';

import React from 'react';
import Link from 'next/link';
import { CreateProjectForm } from '../../../components/CreateProjectForm';

export default function NewProjectPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Navigation & Header */}
      <div>
        <Link
          href="/projects"
          className="text-xs text-gray-400 hover:text-white transition-colors mb-2 inline-block font-mono"
        >
          ← Back to Projects
        </Link>
        <h1 className="text-3xl font-black text-white">Create New Video Project</h1>
        <p className="text-xs text-gray-400 mt-1">
          Upload or record talking-head video footage and supply your spoken script.
        </p>
      </div>

      {/* Form Component */}
      <CreateProjectForm />
    </div>
  );
}
