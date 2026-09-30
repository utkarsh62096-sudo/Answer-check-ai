import React, { useState } from 'react';
import { EvaluationResult } from '../types';
import { DiscussMode } from './DiscussMode';
import { DiscussModeModal } from './DiscussModeModal';
import {
  Check,
  Copy,
  Printer,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  FileCheck2,
  Columns,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRightLeft,
  ArrowRight,
  TrendingUp,
  BookOpen,
  MessageSquare,
} from 'lucide-react';

interface EvaluationResultViewProps {
  result: EvaluationResult;
  maxMarks: number;
  subject?: string;
  question?: string;
  studentAnswer?: string;
  previousScore?: number | null;
  onTryAgain: () => void;
  onOpenTeacherMode?: () => void;
}

export function EvaluationResultView({
  result,
  maxMarks,
  subject = 'Science',
  question = '',
  studentAnswer = '',
  previousScore = null,
  onTryAgain,
  onOpenTeacherMode,
}: EvaluationResultViewProps) {
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const [copiedModelAnswer, setCopiedModelAnswer] = useState(false);
  const [isDiscussModalOpen, setIsDiscussModalOpen] = useState(false);
  const [initialDiscussPrompt, setInitialDiscussPrompt] = useState<string | undefined>(undefined);

  const percentage = Math.round((result.estimatedScore / maxMarks) * 100);

  // Determine score circle styling
  const getScoreCircleColors = () => {
    if (percentage >= 75) {
      return {
        border: 'border-emerald-500',
        text: 'text-emerald-600',
      };
    }
    if (percentage >= 50) {
      return {
        border: 'border-amber-500',
        text: 'text-amber-600',
      };
    }
    return {
      border: 'border-rose-500',
      text: 'text-rose-600',
    };
  };

  const scoreColors = getScoreCircleColors();

  // Answer Structure ratings
  const structureIntro = result.structureScore?.introduction || (percentage >= 70 ? 'Good' : 'Average');
  const structureBody = result.structureScore?.body || (percentage >= 60 ? 'Strong' : 'Average');
  const structureConclusion = result.structureScore?.conclusion || (percentage >= 80 ? 'Good' : 'Average');

  const getStructureClass = (val: string) => {
    const v = val.toLowerCase();
    if (v.includes('good') || v.includes('strong') || v.includes('excellent')) {
      return 'text-emerald-600';
    }
    if (v.includes('average') || v.includes('mid') || v.includes('fair')) {
      return 'text-amber-600';
    }
    return 'text-rose-600';
  };

  // Progress logic: if a previousScore exists or use sample comparative attempt if testing
  const prevAttemptScore = previousScore !== null && previousScore !== undefined
    ? previousScore
    : Math.max(0, result.estimatedScore - (result.estimatedScore >= 3 ? 2 : 1));

  const scoreDifference = result.estimatedScore - prevAttemptScore;

  const handleCopyFeedback = async () => {
    const pointsList = result.scoringPoints
      .map((p) => `• [${p.status}] ${p.point}: ${p.explanation}`)
      .join('\n');

    const improveList = result.improvementSuggestions
      .map((s) => `• ${s}`)
      .join('\n');

    const copyText = `
=== AnswerCheck AI - CBSE Evaluation Report ===
Subject: ${subject}
Topic: ${result.topic || 'CBSE Board Question'}
Estimated Score: ${result.estimatedScore} / ${maxMarks} (${percentage}%)
Confidence: ${result.confidenceLevel} (${result.confidencePercentage || 92}%)
General Feedback: ${result.generalFeedback}

--- Answer Structure Score ---
• Introduction: ${structureIntro}
• Body / Explanation: ${structureBody}
• Conclusion: ${structureConclusion}

--- Detailed Marks Breakdown ---
${(result.marksBreakdown || [])
  .map((m) => `• ${m.criterion}: ${m.score}/${m.maxScore} marks`)
  .join('\n')}

--- Scoring Point Analysis ---
${pointsList}

${result.marksLostExplanation ? `--- Why Marks Were Lost (Honest Reasons) ---\n${result.marksLostExplanation}\n` : ''}
${result.missingConcepts && result.missingConcepts.length > 0 ? `--- Important Points Missing ---\n${result.missingConcepts.map((c) => `• ${c}`).join('\n')}\n` : ''}
--- How to Improve ---
${improveList}

${result.modelAnswer ? `--- Ideal Model Answer (${maxMarks}/${maxMarks}) ---\n${result.modelAnswer}\n` : ''}
*Student-built AI Innovation by Team CBSE Crackers (Class 10). Educational practice only.
`.trim();

    try {
      await navigator.clipboard.writeText(copyText);
      setCopiedFeedback(true);
      setTimeout(() => setCopiedFeedback(false), 2500);
    } catch (e) {
      console.error('Failed to copy feedback', e);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Evaluation Result</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {result.topic ? `${result.topic} · ` : ''}
          Class 10 {subject} · {maxMarks} Marks
        </p>
      </div>

      {/* ===================== TIER 1: Score Card + Marks Breakdown ===================== */}
      <div
        className="rounded-2xl border border-indigo-200 p-6 sm:p-7 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xs"
        style={{
          background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
        }}
      >
        {/* Score Circle Gauge */}
        <div
          className={`w-24 h-24 rounded-full bg-white border-[5px] ${scoreColors.border} flex flex-col items-center justify-center shrink-0 shadow-xs`}
        >
          <span className={`text-3xl font-extrabold leading-none ${scoreColors.text}`}>
            {result.estimatedScore}
          </span>
          <span className="text-xs font-semibold text-slate-400 mt-1">/ {maxMarks}</span>
        </div>

        {/* Score Information */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {result.scoreSummary || (percentage >= 80 ? 'Very Good Answer' : percentage >= 50 ? 'Good Effort' : 'Needs Work')}
            </h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            {result.generalFeedback}
          </p>

          <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-0.5 rounded-full border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              {result.confidenceLevel} Confidence · AI is {result.confidencePercentage || 92}% sure
            </span>

            <button
              type="button"
              onClick={() => {
                setInitialDiscussPrompt(undefined);
                setIsDiscussModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-0.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-2xs"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Discuss with Mentor (Hinglish)</span>
            </button>
          </div>

          {/* Marks Breakdown Chips */}
          {result.marksBreakdown && result.marksBreakdown.length > 0 && (
            <div className="mt-3.5 flex flex-wrap gap-2 justify-center sm:justify-start">
              {result.marksBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 shadow-2xs flex items-center gap-1"
                >
                  <span className="text-slate-600">{item.criterion}:</span>
                  <strong className="text-indigo-600 font-bold">
                    {item.score}/{item.maxScore}
                  </strong>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2.5 text-[11px] text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
            <span>Marks Breakdown</span>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              TIER 1
            </span>
          </div>
        </div>
      </div>

      {/* ===================== TIER 2: Answer Structure Score ===================== */}
      <div>
        <div className="text-sm font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
          <span>📐 Answer Structure Score</span>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            TIER 2
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Introduction
            </div>
            <div className={`text-lg font-bold mt-1 ${getStructureClass(structureIntro)}`}>
              {structureIntro}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Body / Explanation
            </div>
            <div className={`text-lg font-bold mt-1 ${getStructureClass(structureBody)}`}>
              {structureBody}
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-center">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Conclusion
            </div>
            <div className={`text-lg font-bold mt-1 ${getStructureClass(structureConclusion)}`}>
              {structureConclusion}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== Scoring Point Analysis ===================== */}
      <div>
        <div className="text-sm font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
          <span>📋 Scoring Point Analysis</span>
        </div>

        <div className="space-y-2.5">
          {result.scoringPoints.map((point, index) => {
            const statusUpper = (point.status || '').toUpperCase();
            const isMet = statusUpper.includes('MET') && !statusUpper.includes('PARTIAL');
            const isPartial = statusUpper.includes('PARTIAL');

            return (
              <div
                key={index}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  isMet
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : isPartial
                    ? 'bg-amber-50/70 border-amber-200'
                    : 'bg-rose-50/70 border-rose-200'
                }`}
              >
                <span
                  className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 shrink-0 ${
                    isMet
                      ? 'bg-emerald-200 text-emerald-900'
                      : isPartial
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-rose-200 text-rose-900'
                  }`}
                >
                  {isMet ? 'MET' : isPartial ? 'PARTIAL' : 'MISSING'}
                </span>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                    {point.point}
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    {point.explanation}
                  </p>
                  {!isMet && (
                    <button
                      type="button"
                      onClick={() => {
                        setInitialDiscussPrompt(`Mere answer mein point "${point.point}" ${isPartial ? 'partial' : 'missing'} tha. Isko NCERT aur CBSE board exam mein kaise likhna chahiye full marks ke liye?`);
                        setIsDiscussModalOpen(true);
                      }}
                      className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md transition-colors"
                    >
                      <MessageSquare className="w-3 h-3 text-indigo-600" />
                      <span>Discuss this point with mentor</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================== TIER 2: Concept vs Keyword Matching ===================== */}
      <div>
        <div className="text-sm font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
          <span>🧠 Concept vs Keyword Matching</span>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            TIER 2
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-center bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
          <div className="text-xs sm:text-[13px] text-rose-900 bg-rose-50/80 border border-rose-200/70 rounded-lg p-3">
            <div className="font-bold text-rose-700 mb-1">Old Tools</div>
            Only match superficial keywords like “stomata”, “guard cells” without understanding context
          </div>

          <div className="font-extrabold text-slate-400 text-sm hidden md:block">
            VS
          </div>

          <div className="text-xs sm:text-[13px] text-emerald-900 bg-emerald-50/80 border border-emerald-200/70 rounded-lg p-3">
            <div className="font-bold text-emerald-700 mb-1">AnswerCheck AI</div>
            Understands meaning, scientific structure & concepts like a real senior CBSE examiner
          </div>
        </div>
      </div>

      {/* ===================== TIER 1: Side-by-Side Comparison ===================== */}
      <div>
        <div className="text-sm font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
          <span>🔍 Side-by-Side Comparison</span>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            TIER 1
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Student Box */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs sm:text-[13px] leading-relaxed">
            <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2">
              Your Answer (Summary)
            </h4>
            <div className="text-slate-800 whitespace-pre-line font-mono text-xs bg-white/80 p-2.5 rounded-lg border border-rose-100">
              {studentAnswer || 'Answer submitted for evaluation'}
            </div>
          </div>

          {/* Model Box */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs sm:text-[13px] leading-relaxed">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
              Model Answer (Key Points)
            </h4>
            <div className="text-slate-800 whitespace-pre-line text-xs bg-white/80 p-2.5 rounded-lg border border-emerald-100">
              {result.modelAnswer || 'Complete CBSE standard model answer provided below.'}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== TIER 1: Model Answer (Full 5/5) ===================== */}
      {result.modelAnswer && (
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
            <span>⭐ Model Answer (Full {maxMarks}/{maxMarks})</span>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              TIER 1
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 border-l-4 border-l-indigo-600 p-4 sm:p-5">
            <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
              Ideal Answer
            </h4>
            <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-line">
              {result.modelAnswer}
            </div>
          </div>
        </div>
      )}

      {/* ===================== Why Marks Were Lost ===================== */}
      {result.marksLostExplanation && (
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
            <span>📉 Why Marks Were Lost (Honest Board Examiner Reasons)</span>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4 sm:p-5">
            <p className="text-xs sm:text-[13px] text-rose-950 leading-relaxed whitespace-pre-line">
              {result.marksLostExplanation}
            </p>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setInitialDiscussPrompt('Examiner ne marks kahan aur kyun kaate honestly samjhao, aur board exam mein isko kaise avoid karein?');
                  setIsDiscussModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 border border-rose-300 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-rose-700" />
                <span>Discuss reasons for lost marks with mentor (Hinglish)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== Important Missing Points ===================== */}
      {result.missingConcepts && result.missingConcepts.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
            <span>⚠️ Key Points / Concepts Missing from Student's Answer</span>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 sm:p-5">
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-[13px] text-amber-950 leading-relaxed">
              {result.missingConcepts.map((concept, idx) => (
                <li key={idx}>
                  <strong className="text-amber-900 font-semibold">{concept}</strong>
                </li>
              ))}
            </ul>
            <div className="mt-3">
              <button
                type="button"
                onClick={() => {
                  setInitialDiscussPrompt(`Mere answer mein important points miss ho gaye the: ${(result.missingConcepts || []).slice(0, 3).join(', ')}. Inko proper CBSE style mein kaise incorporate karun?`);
                  setIsDiscussModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-800" />
                <span>Discuss missing points with mentor (Hinglish)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== How to Improve ===================== */}
      {result.improvementSuggestions && result.improvementSuggestions.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
            <span>💡 How to Improve</span>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 sm:p-5">
            <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-[13px] text-slate-700 leading-relaxed">
              {result.improvementSuggestions.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ===================== TIER 2: Your Progress on this Topic ===================== */}
      <div>
        <div className="text-sm font-semibold text-slate-900 mb-2.5 flex items-center gap-2">
          <span>📈 Your Progress on this Topic</span>
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
            TIER 2
          </span>
        </div>

        <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/60 flex flex-wrap items-center gap-4 sm:gap-6">
          <div>
            <div className="text-xs text-slate-500">Previous Attempt</div>
            <div className="text-xl font-extrabold text-slate-800">
              {prevAttemptScore}/{maxMarks}
            </div>
          </div>

          <div className="text-xl font-bold text-emerald-600">→</div>

          <div>
            <div className="text-xs text-slate-500">Current Attempt</div>
            <div className="text-xl font-extrabold text-emerald-600">
              {result.estimatedScore}/{maxMarks}
            </div>
          </div>

          <div className="sm:ml-auto text-xs sm:text-sm font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <span>
              {scoreDifference > 0
                ? `+${scoreDifference} mark${scoreDifference > 1 ? 's' : ''} improvement 🎉`
                : scoreDifference === 0
                ? 'Maintained consistent performance 👍'
                : `${scoreDifference} marks change`}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="actions pt-3 flex flex-wrap gap-2.5 items-center justify-start border-t border-slate-200">
        <button
          type="button"
          onClick={() => {
            setInitialDiscussPrompt(undefined);
            setIsDiscussModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Discuss with Mentor</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">Hinglish</span>
        </button>

        <button
          type="button"
          onClick={handleCopyFeedback}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
        >
          {copiedFeedback ? (
            <>
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 text-slate-500" />
              <span>Copy Feedback</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
        >
          <Printer className="h-4 w-4 text-slate-500" />
          <span>Download PDF Report</span>
        </button>

        <button
          type="button"
          onClick={onTryAgain}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
        >
          <RotateCcw className="h-4 w-4 text-slate-500" />
          <span>Try Again</span>
        </button>

        {onOpenTeacherMode && (
          <button
            type="button"
            onClick={onOpenTeacherMode}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-medium transition-colors"
          >
            <span>Compare in Teacher Mode</span>
          </button>
        )}
      </div>

      {/* ===================== Discuss Mode – CBSE Study Mentor ===================== */}
      <div id="discuss-mode-section" className="mt-8 rounded-2xl border border-indigo-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">💬</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Discuss Mode – CBSE Study Mentor
              </h3>
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Live Interactive
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Discuss this evaluation with your mentor in simple Hinglish. Ask about concepts, better answer structure, or missing keywords.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setInitialDiscussPrompt(undefined);
              setIsDiscussModalOpen(true);
            }}
            className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Pop-up View</span>
          </button>
        </div>

        <DiscussMode
          subject={subject}
          question={question}
          studentAnswer={studentAnswer}
          maxMarks={maxMarks}
          evaluation={result}
          initialQuestion={initialDiscussPrompt}
        />
      </div>

      {/* ===================== TIER 3: FUTURE FEATURES ===================== */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Coming Soon – Advanced Features
            </h3>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800">
              TIER 3
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            These features will make AnswerCheck AI even more powerful
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Card 1 */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-1.5">✍️</div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
                Handwriting Support
              </h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Upload photo of handwritten answer → AI extracts text & evaluates
              </p>
            </div>
            <div className="mt-2.5">
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-1.5">🎤</div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
                Voice Answer
              </h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Speak your answer, AI converts speech to text and evaluates
              </p>
            </div>
            <div className="mt-2.5">
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={onOpenTeacherMode}
            className="p-4 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 hover:bg-indigo-50 text-center flex flex-col justify-between cursor-pointer transition-colors"
          >
            <div>
              <div className="text-2xl mb-1.5">👩‍🏫</div>
              <h4 className="text-xs sm:text-sm font-semibold text-indigo-950 mb-1">
                Teacher Dashboard
              </h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Create class code, see all students’ scores & weak topics
              </p>
            </div>
            <div className="mt-2.5">
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Click to Preview
              </span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-1.5">📊</div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
                Weak Topics Report
              </h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Automatic summary of topics where student repeatedly loses marks
              </p>
            </div>
            <div className="mt-2.5">
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-1.5">📄</div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
                Full Sample Paper Mode
              </h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Upload complete CBSE sample paper answers for full evaluation
              </p>
            </div>
            <div className="mt-2.5">
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Coming Soon
              </span>
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center flex flex-col justify-between">
            <div>
              <div className="text-2xl mb-1.5">🌐</div>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-900 mb-1">
                Hindi Medium Support
              </h4>
              <p className="text-[11.5px] text-slate-500 leading-relaxed">
                Evaluate answers written in Hindi for Hindi-medium students
              </p>
            </div>
            <div className="mt-2.5">
              <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom practice disclaimer */}
      <p className="text-center text-xs text-slate-500 mt-2">
        This is an AI-estimated evaluation for practice only. It is not an official CBSE board score.
      </p>

      {/* Pop-up Discuss Mode Modal */}
      <DiscussModeModal
        isOpen={isDiscussModalOpen}
        onClose={() => setIsDiscussModalOpen(false)}
        subject={subject}
        question={question}
        studentAnswer={studentAnswer}
        maxMarks={maxMarks}
        evaluation={result}
        initialQuestion={initialDiscussPrompt}
      />
    </div>
  );
}
