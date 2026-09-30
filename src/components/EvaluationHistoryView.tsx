import React, { useState, useMemo } from 'react';
import { EvaluationHistoryItem } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Clock, Trash2, ArrowUpRight, Award, CheckCircle2, Filter } from 'lucide-react';

interface EvaluationHistoryViewProps {
  history: EvaluationHistoryItem[];
  onSelectHistoryItem: (item: EvaluationHistoryItem) => void;
  onClearHistory: () => void;
}

export function EvaluationHistoryView({
  history,
  onSelectHistoryItem,
  onClearHistory,
}: EvaluationHistoryViewProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  const CORE_SUBJECTS = ['Science', 'Social Science', 'Mathematics', 'English', 'Hindi'];

  // Extract all unique subjects present in history combined with core school subjects
  const availableSubjects = useMemo(() => {
    const fromHistory = history.map((h) => h.subject).filter(Boolean);
    const set = new Set<string>();
    CORE_SUBJECTS.forEach((s) => set.add(s));
    fromHistory.forEach((s) => set.add(s));
    return Array.from(set);
  }, [history]);

  const isSubjectMatch = (itemSubject: string, targetSubject: string) => {
    const is = (itemSubject || '').toLowerCase().trim();
    const ts = (targetSubject || '').toLowerCase().trim();
    if (ts === 'all') return true;
    if (is === ts) return true;
    if ((ts === 'maths' || ts === 'mathematics') && (is === 'maths' || is === 'mathematics')) return true;
    return false;
  };

  // Filter history based on selected subject
  const filteredHistory = useMemo(() => {
    if (selectedSubject === 'ALL') {
      return history;
    }
    return history.filter((item) => isSubjectMatch(item.subject, selectedSubject));
  }, [history, selectedSubject]);

  if (history.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
        <Clock className="mx-auto h-10 w-10 text-slate-300 mb-3" />
        <h4 className="text-base font-semibold text-slate-700">No evaluations yet</h4>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
          Your last 5 evaluated answers will appear here automatically with performance trend graphs.
        </p>
      </div>
    );
  }

  // Chronological order (oldest to newest) for chart
  const chartData = [...filteredHistory]
    .reverse()
    .map((item, index) => ({
      attempt: `#${index + 1}`,
      percentage: item.percentage,
      score: `${item.estimatedScore}/${item.maxMarks}`,
      subject: item.subject,
      timestamp: item.timestamp,
    }));

  const avgPercentage = filteredHistory.length > 0
    ? Math.round(filteredHistory.reduce((sum, item) => sum + item.percentage, 0) / filteredHistory.length)
    : 0;
  const bestScore = filteredHistory.length > 0
    ? Math.max(...filteredHistory.map((h) => h.percentage))
    : 0;
  const latestScore = filteredHistory.length > 0
    ? filteredHistory[0].percentage
    : 0;

  return (
    <div className="space-y-6">
      {/* Subject Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-indigo-600 shrink-0" />
          <label htmlFor="subject-filter-select" className="text-xs font-semibold text-slate-700">
            Filter by Subject:
          </label>
        </div>

        <div className="flex items-center gap-2">
          <select
            id="subject-filter-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full sm:w-auto text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-2xs"
          >
            <option value="ALL">All Subjects ({history.length})</option>
            {availableSubjects.map((subj) => {
              const count = history.filter((h) => isSubjectMatch(h.subject, subj)).length;
              return (
                <option key={subj} value={subj}>
                  {subj} ({count})
                </option>
              );
            })}
          </select>

          {selectedSubject !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedSubject('ALL')}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 transition-colors whitespace-nowrap"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-200 bg-white">
          <p className="text-sm font-medium text-slate-700">
            No evaluations found for "{selectedSubject}".
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try choosing another subject or reset to view all evaluations.
          </p>
          <button
            type="button"
            onClick={() => setSelectedSubject('ALL')}
            className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            Show All Subjects
          </button>
        </div>
      ) : (
        <>
          {/* Stat summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Latest Score</span>
                <TrendingUp className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-indigo-900">{latestScore}%</span>
                <span className="text-xs text-indigo-600 font-medium">({filteredHistory[0].estimatedScore}/{filteredHistory[0].maxMarks} marks)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Average Score</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-emerald-900">{avgPercentage}%</span>
                <span className="text-xs text-emerald-600 font-medium">across {filteredHistory.length} evaluation{filteredHistory.length > 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Best Score</span>
                <Award className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-amber-900">{bestScore}%</span>
                <span className="text-xs text-amber-600 font-medium">subject peak</span>
              </div>
            </div>
          </div>

          {/* Progress Chart */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Score Progression Trend {selectedSubject !== 'ALL' ? `(${selectedSubject})` : ''}
                </h4>
                <p className="text-xs text-slate-500">
                  Percentage score for your {filteredHistory.length} evaluation{filteredHistory.length > 1 ? 's' : ''}
                </p>
              </div>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {filteredHistory.length} Attempt{filteredHistory.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="attempt" tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tick={{ fill: '#64748b', fontSize: 12 }} unit="%" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-lg text-xs space-y-1">
                            <p className="font-semibold text-indigo-300">{data.subject}</p>
                            <p className="text-slate-200">Score: {data.score} ({data.percentage}%)</p>
                            <p className="text-slate-400 text-[10px]">{data.timestamp}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ fill: '#4f46e5', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#4338ca' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-800">
                  Recent Attempt History
                </h4>
                <span className="text-xs text-slate-400">
                  ({filteredHistory.length} of {history.length})
                </span>
              </div>
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs font-medium text-slate-500 hover:text-rose-600 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear History
              </button>
            </div>

            <div className="space-y-2">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                        {item.subject}
                      </span>
                      <span className="text-xs text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate" title={item.question}>
                      {item.question}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {item.estimatedScore} / {item.maxMarks}
                      </div>
                      <div className="text-xs font-semibold text-indigo-600">
                        {item.percentage}%
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectHistoryItem(item)}
                      className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="View Report"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

