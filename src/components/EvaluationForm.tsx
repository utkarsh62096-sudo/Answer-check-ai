import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

interface EvaluationFormProps {
  onSubmit: (data: {
    subject: string;
    maxMarks: number;
    question: string;
    answer: string;
  }) => void;
  isLoading: boolean;
}

export function EvaluationForm({ onSubmit, isLoading }: EvaluationFormProps) {
  const [subject, setSubject] = useState('Science');
  const [maxMarks, setMaxMarks] = useState<number>(5);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadSample = (type: 'science' | 'sst' | 'science9') => {
    if (type === 'science') {
      setSubject('Science');
      setMaxMarks(5);
      setQuestion(
        'Describe the role of stomata in photosynthesis and explain how the opening and closing of stomata are regulated in plants.'
      );
      setAnswer(
        'Stomata are tiny pores present on the surface of leaves. They help in exchange of gases like carbon dioxide and oxygen during photosynthesis. The opening and closing of stomata is controlled by guard cells. When water flows into guard cells, they become turgid and swell, causing the stomatal pore to open. When water leaves, guard cells become flaccid and shrink, causing the pore to close. Plants close stomata when they do not need CO2 to conserve water.'
      );
    } else if (type === 'sst') {
      setSubject('Social Science');
      setMaxMarks(3);
      setQuestion(
        'Explain any three key features of Federalism with reference to the Indian Constitution.'
      );
      setAnswer(
        '1. There are two or more levels (or tiers) of government: Union Government and State Governments.\n2. Different tiers of government govern the same citizens, but each tier has its own jurisdiction in specific matters of legislation, taxation, and administration.\n3. The fundamental provisions of the Constitution cannot be unilaterally changed by one level of government; such amendments require the consent of both levels.'
      );
    } else if (type === 'science9') {
      setSubject('Science');
      setMaxMarks(3);
      setQuestion(
        'Why does our palm feel cold when we put some acetone or perfume or petrol on it?'
      );
      setAnswer(
        'When we put acetone or perfume on our palm, the particles gain energy from our palm or surroundings and evaporate rapidly. Because evaporation causes cooling by absorbing the latent heat of vaporization from the surface of the skin, our palm feels cold.'
      );
    }
    setUploadedFileName(null);
    setFileError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    onSubmit({
      subject,
      maxMarks: Number(maxMarks),
      question: question.trim(),
      answer: answer.trim(),
    });
  };

  const processFile = (file: File) => {
    setFileError(null);
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFileError('File size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setAnswer(content);
        setUploadedFileName(file.name);
      }
    };
    reader.onerror = () => {
      setFileError('Could not read the uploaded file. Please paste text directly.');
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const words = answer.trim() ? answer.trim().split(/\s+/).filter((w) => w.length > 0) : [];
  const wordCount = words.length;

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-1 text-gray-900">Evaluate Your Answer</h2>
      <p className="text-gray-500 text-sm mb-6">
        Get concept + structure based feedback (not just keywords)
      </p>

      {/* Quick Samples */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-indigo-600" />
          Quick Test with Sample Questions:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => loadSample('science')}
            disabled={isLoading}
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium border border-gray-200/70"
          >
            Class 10 Science (Stomata)
          </button>
          <button
            type="button"
            onClick={() => loadSample('sst')}
            disabled={isLoading}
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium border border-gray-200/70"
          >
            Class 10 SST (Federalism)
          </button>
          <button
            type="button"
            onClick={() => loadSample('science9')}
            disabled={isLoading}
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors font-medium border border-gray-200/70"
          >
            Class 9 Science
          </button>
        </div>
      </div>

      {/* Form Fields: Subject & Max Marks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <select
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800"
          >
            <option value="Science">Science (Physics / Chemistry / Biology)</option>
            <option value="Social Science">Social Science</option>
            <option value="English">English</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>

        <div>
          <label htmlFor="maxMarks" className="block text-sm font-medium text-gray-700 mb-1">
            Maximum Marks
          </label>
          <select
            id="maxMarks"
            value={maxMarks}
            onChange={(e) => setMaxMarks(Number(e.target.value))}
            disabled={isLoading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
          </select>
        </div>
      </div>

      {/* CBSE Board Question */}
      <div className="mb-4">
        <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
          CBSE Board Question
        </label>
        <textarea
          id="question"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Paste the exact question here..."
          disabled={isLoading}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder:text-gray-400"
        />
      </div>

      {/* Student's Written Answer */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
            Student's Written Answer
          </label>
          {answer.trim() && (
            <button
              type="button"
              onClick={() => {
                setAnswer('');
                setUploadedFileName(null);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Clear
            </button>
          )}
        </div>
        <textarea
          id="answer"
          rows={8}
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            if (uploadedFileName) setUploadedFileName(null);
          }}
          placeholder="Write or paste the student's answer here..."
          disabled={isLoading}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-800 placeholder:text-gray-400 font-sans leading-relaxed"
        />
        <p className="text-xs text-gray-400 mt-1">
          <span id="wordCount">{wordCount}</span> words
        </p>
      </div>

      {/* Optional File Upload Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-3.5 mb-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50'
            : 'border-gray-200 hover:border-indigo-300 bg-gray-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.rtf"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
        <div className="flex items-center justify-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            {uploadedFileName ? <FileText className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
          </div>
          <div className="text-left text-xs">
            <span className="font-medium text-gray-700">
              {uploadedFileName ? (
                <span className="text-indigo-600 font-semibold">Loaded: {uploadedFileName}</span>
              ) : (
                <span>Upload an answer text file (.txt, .md)</span>
              )}
            </span>
            <span className="text-gray-400 ml-1.5 hidden sm:inline">
              — drag and drop or click
            </span>
          </div>
        </div>
      </div>

      {fileError && (
        <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100 mb-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{fileError}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        id="evalBtn"
        disabled={isLoading || !question.trim() || !answer.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Evaluating Answer with Concept-based Marking Scheme...</span>
          </>
        ) : (
          <span>Check My Answer</span>
        )}
      </button>
    </form>
  );
}
