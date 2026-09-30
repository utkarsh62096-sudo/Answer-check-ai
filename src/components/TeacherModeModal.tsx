import React, { useState } from 'react';
import {
  X,
  Users,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  FileSpreadsheet,
  PlusCircle,
  GraduationCap,
} from 'lucide-react';

interface TeacherModeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TeacherModeModal({ isOpen, onClose }: TeacherModeModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const classCode = 'CBSE-10B-SCIENCE-99';

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(classCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">Teacher Dashboard Mode</h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  TIER 3 Preview
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Created by Team CBSE Crackers for School Innovation Showcase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Class Code Card */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                Active Classroom Code
              </span>
              <div className="text-lg font-mono font-bold text-slate-900 tracking-wide mt-0.5">
                {classCode}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Share this with your Class 9 & 10 students to collect answers automatically.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              {copiedCode ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Students</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">38</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Evaluations</div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">142</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-xs text-slate-500">Class Avg</div>
              <div className="text-lg font-bold text-emerald-600 mt-0.5">74%</div>
            </div>
          </div>

          {/* Weak Topics Automatic Detection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                AI-Detected Weak Conceptual Areas
              </h4>
              <span className="text-[11px] text-slate-400">Class 10 Science</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl border border-rose-100 bg-rose-50/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-rose-950">
                    Turgor pressure & osmosis mechanism in Guard cells
                  </p>
                  <p className="text-[11px] text-rose-700">68% of students missed this keyword</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                  Critical
                </span>
              </div>

              <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-amber-950">
                    Mention of Transpiration along with Photosynthesis
                  </p>
                  <p className="text-[11px] text-amber-700">52% of students left this point out</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  Moderate
                </span>
              </div>
            </div>
          </div>

          {/* Teacher Actions */}
          <div className="pt-2 flex flex-wrap gap-2.5 items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Close Preview
            </button>

            <button
              type="button"
              onClick={() => alert('Classroom assignment generator will be activated in Tier 3 release!')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              Create Class Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
