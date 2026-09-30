/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { EvaluationForm } from './components/EvaluationForm';
import { EvaluationResultView } from './components/EvaluationResultView';
import { EvaluationHistoryView } from './components/EvaluationHistoryView';
import { TeacherModeModal } from './components/TeacherModeModal';
import { EvaluationResult, EvaluationHistoryItem } from './types';
import { BookOpenCheck, History, Edit3, ShieldAlert, Sparkles, GraduationCap, MessageSquare } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'cbse_answercheck_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'evaluate' | 'history'>('evaluate');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<{
    subject: string;
    maxMarks: number;
    question: string;
    answer: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EvaluationHistoryItem[]>([]);

  // Load history from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed: EvaluationHistoryItem[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 5));
        }
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  const saveToHistory = (
    sub: { subject: string; maxMarks: number; question: string; answer: string },
    evalResult: EvaluationResult
  ) => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    const percentage = Math.round((evalResult.estimatedScore / sub.maxMarks) * 100);

    const newItem: EvaluationHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: formattedDate,
      dateNumber: Date.now(),
      subject: sub.subject,
      question: sub.question,
      answer: sub.answer,
      maxMarks: sub.maxMarks,
      estimatedScore: evalResult.estimatedScore,
      percentage: isNaN(percentage) ? 0 : Math.min(100, Math.max(0, percentage)),
      result: evalResult,
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 5);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to persist history', err);
      }
      return updated;
    });
  };

  const handleEvaluate = async (data: {
    subject: string;
    maxMarks: number;
    question: string;
    answer: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setCurrentSubmission(data);

    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Failed to evaluate answer. Please try again.');
      }

      const evaluation: EvaluationResult = resData;
      setResult(evaluation);
      saveToHistory(data, evaluation);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during evaluation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setResult(null);
    setError(null);
  };

  const handleSelectHistoryItem = (item: EvaluationHistoryItem) => {
    setCurrentSubmission({
      subject: item.subject,
      maxMarks: item.maxMarks,
      question: item.question,
      answer: item.answer,
    });
    setResult(item.result);
    setActiveTab('evaluate');
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-xs">
              A
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="font-bold text-lg leading-tight text-gray-900">
                  AnswerCheck AI
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  CBSE 9 & 10
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Concept-based evaluation for CBSE 9 & 10
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
              Free Practice Tool
            </span>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                activeTab === 'history'
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>History</span>
              {history.length > 0 && (
                <span className="h-4 min-w-4 px-1 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                  {history.length}
                </span>
              )}
            </button>

            {result && (
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('discuss-mode-section');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-all shadow-2xs"
              >
                <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                <span>Discuss</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsTeacherModalOpen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Teacher Mode</span>
              <span className="sm:hidden">Teacher</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('evaluate');
                setResult(null);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Evaluate</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 flex-1 w-full">
        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl p-4 mb-4">
          <strong>Note:</strong> This is an AI practice tool. Scores are estimates only and not official CBSE marks. Always cross-check with your teacher.
        </div>

        {/* TIER 1: Student-built banner */}
        <div
          className="student-banner mb-6 rounded-xl border border-indigo-200 p-3 sm:px-4 sm:py-2.5 flex items-center justify-between gap-3 text-xs sm:text-[13px] text-slate-800 shadow-2xs no-print"
          style={{
            background: 'linear-gradient(90deg, #EEF2FF 0%, #F0FDF4 100%)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl shrink-0" role="img" aria-label="Student">👨‍🎓</span>
            <div>
              <strong className="text-indigo-700 font-bold">Built by CBSE Class 10 students</strong>{' '}
              for CBSE Class 9 & 10 students · Team CBSE Crackers
            </div>
          </div>
          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            TIER 1
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6 md:p-8">
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm">
                <p className="font-semibold">Evaluation Notice</p>
                <p className="mt-0.5">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeTab === 'history' ? (
            <div>
              <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Performance History & Progress</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Review your last 5 answer evaluations, score trends, and progress over time.
                  </p>
                </div>
              </div>
              <EvaluationHistoryView
                history={history}
                onSelectHistoryItem={handleSelectHistoryItem}
                onClearHistory={handleClearHistory}
              />
            </div>
          ) : (
            <>
              {!result ? (
                <EvaluationForm onSubmit={handleEvaluate} isLoading={isLoading} />
              ) : (
                <div id="resultSection">
                  <EvaluationResultView
                    result={result}
                    maxMarks={currentSubmission?.maxMarks || 5}
                    subject={currentSubmission?.subject}
                    question={currentSubmission?.question}
                    studentAnswer={currentSubmission?.answer}
                    previousScore={
                      history.find(
                        (h) =>
                          h.question.toLowerCase().trim() === (currentSubmission?.question || '').toLowerCase().trim() ||
                          h.subject.toLowerCase() === (currentSubmission?.subject || '').toLowerCase()
                      )?.estimatedScore ?? null
                    }
                    onTryAgain={handleTryAgain}
                    onOpenTeacherMode={() => setIsTeacherModalOpen(true)}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-8 no-print space-y-1">
          <p>AnswerCheck AI • Built for CBSE Class 9 & 10 Students • For practice only</p>
          <p className="text-[11px] text-gray-500">
            Built by Team CBSE Crackers (Class 10 Students) · National School Innovation Showcase
          </p>
        </footer>
      </main>

      {/* Teacher Mode Modal */}
      <TeacherModeModal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
      />
    </div>
  );
}


