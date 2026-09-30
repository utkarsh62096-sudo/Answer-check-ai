import React from 'react';
import { EvaluationResult } from '../types';
import { DiscussMode } from './DiscussMode';

interface DiscussModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  question: string;
  studentAnswer: string;
  maxMarks: number;
  evaluation: EvaluationResult;
  initialQuestion?: string;
}

export function DiscussModeModal({
  isOpen,
  onClose,
  subject,
  question,
  studentAnswer,
  maxMarks,
  evaluation,
  initialQuestion,
}: DiscussModeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-3xl h-[85vh] relative animate-scaleUp">
        <DiscussMode
          subject={subject}
          question={question}
          studentAnswer={studentAnswer}
          maxMarks={maxMarks}
          evaluation={evaluation}
          initialQuestion={initialQuestion}
          isModal={true}
          onClose={onClose}
        />
      </div>
    </div>
  );
}
