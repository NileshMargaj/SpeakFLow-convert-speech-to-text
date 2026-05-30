import React from 'react';
import { Sparkles, Download, FileText } from 'lucide-react';

const Transcription = ({ text = '', transcriptId, isLoading, statusMessage, onDownload }) => {
  const displayText = text || 'Upload an audio file or record your voice to generate a transcription.';
  const characterCount = text.length;

  return (
    <div className="flex h-full min-h-0 items-stretch bg-gray-50">
      <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-md">
        
        {/* Header Section */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-indigo-500">
              <Sparkles size={20} fill="currentColor" />
            </div>
            <h2 className="text-base font-bold text-slate-800">Transcription</h2>
          </div>

          <div className="flex items-center">
            

          </div>
        </div>

        {/* Content Body */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <p className={`line-clamp-4 text-sm font-medium leading-relaxed ${text ? 'text-slate-700' : 'text-slate-400'}`}>
            {isLoading ? statusMessage || 'Generating transcription...' : displayText}
          </p>
        </div>

        {/* Footer Section */}
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-50 pt-3">
          <div className="flex items-center gap-2 text-slate-400">
            <FileText size={16} />
            <span className="text-sm font-medium">{characterCount} characters</span>
          </div>

          <button
            onClick={() => onDownload?.(transcriptId)}
            disabled={!transcriptId}
            className="flex items-center justify-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm transition-all hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 w-full sm:w-auto"
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>

      </div>
    </div>
  );
};

export default Transcription;
