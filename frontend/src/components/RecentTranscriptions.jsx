import React from 'react';
import { Download, FileText } from 'lucide-react';

const formatTimeAgo = (dateValue) => {
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const RecentTranscriptions = ({ items = [], isLoading, onSelect, onDownload }) => {

  return (
    <div className="flex h-full min-h-0 items-stretch bg-gray-50">
      <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-md">
        
        {/* Header section */}
        <div className="mb-2 flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-slate-800">Recent Transcriptions</h2>
          <span className="text-xs font-semibold text-slate-400">{items.length} shown</span>
        </div>

        {/* List mapping */}
        <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-hidden">
          {isLoading && (
            <div className="px-2 py-4 text-sm font-medium text-slate-400">
              Loading history...
            </div>
          )}

          {!isLoading && !items.length && (
            <div className="px-2 py-4 text-sm font-medium text-slate-400">
              No transcriptions yet.
            </div>
          )}

          {!isLoading && items.map((item) => (
            <div 
              key={item.audioTranscriptId} 
              className="group flex items-center justify-between rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50/50"
            >
              {/* Left Side: Icon & Details */}
              <button
                type="button"
                onClick={() => onSelect?.(item)}
                className="flex min-w-0 items-center gap-3 text-left"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.audioType === 'recorded' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-600'} shadow-sm`}>
                  <FileText size={17} fill="currentColor" className="fill-current opacity-80" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold text-slate-800 transition-colors group-hover:text-indigo-600">
                    {item.audioName}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatTimeAgo(item.createdAt)}
                  </p>
                </div>
              </button>

              {/* Right Side: Duration & Actions */}
              <div className="flex shrink-0 items-center gap-3">
                <span className="text-xs font-medium text-slate-500">
                  {item.audioType}
                </span>
                <button
                  type="button"
                  onClick={() => onDownload?.(item.audioTranscriptId)}
                  className="rounded-lg p-1 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                >
                  <Download size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default RecentTranscriptions;
