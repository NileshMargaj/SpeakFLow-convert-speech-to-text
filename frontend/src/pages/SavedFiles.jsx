import React, { useCallback, useEffect, useState } from "react";
import { Download, FileAudio, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function formatTimeAgo(dateValue) {
  const date = new Date(dateValue);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(Math.floor(diffMs / 60000), 0);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function SavedFiles() {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/saved/files?page=${page}&limit=${limit}`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load saved files");
      }

      setFiles(data.files || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = async (file) => {
    try {
      if (!file?.imagekitUrl) return;

      // For now ImageKit URL is publicly accessible; user auth is enforced server-side on listing.
      // Download directly from the URL.
      const res = await fetch(file.imagekitUrl, { credentials: "omit" });
      if (!res.ok) throw new Error("Failed to download file");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const ext = file.audioType === "recorded" ? "webm" : "audio";
      link.download = `speakflow-${file.audioType}-${file.audioId || "file"}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setStatusMessage(e.message || "Download failed");
    }
  };

  return (
    <div className="h-full min-h-0 w-full overflow-hidden p-1">
      <div className="flex h-full min-h-0 w-full flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Saved Files
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Browse your saved uploaded and recorded audio.
            </p>
          </div>

          <div className="text-right">
            {statusMessage ? (
              <p className="text-sm font-medium text-red-600">{statusMessage}</p>
            ) : isLoading ? (
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2 justify-end">
                <Loader2 size={16} className="animate-spin" /> Loading...
              </p>
            ) : (
              <p className="text-sm font-medium text-gray-500">
                Page {page} of {totalPages}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <div className="flex h-full min-h-0 items-stretch bg-gray-50">
            <div className="flex h-full min-h-0 w-full flex-col rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between px-1">
                <h2 className="text-base font-bold text-slate-800">Your Audio</h2>
                <span className="text-xs font-semibold text-slate-400">
                  {files.length} shown
                </span>
              </div>

              <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-hidden">
                {isLoading && (
                  <div className="px-2 py-4 text-sm font-medium text-slate-400">
                    Loading saved files...
                  </div>
                )}

                {!isLoading && !files.length && (
                  <div className="px-2 py-4 text-sm font-medium text-slate-400">
                    No saved files yet.
                  </div>
                )}

                {!isLoading &&
                  files.map((item) => (
                    <div
                      key={`${item.audioType}-${item.audioId}`}
                      className="group flex items-center justify-between rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50/50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm ${
                            item.audioType === "recorded"
                              ? "bg-rose-50 text-rose-500"
                              : "bg-blue-50 text-blue-600"
                          }`}
                        >
                          <FileAudio size={17} className="opacity-80" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-bold text-slate-800 group-hover:text-indigo-600">
                            {item.audioName}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {item.audioType} • {formatTimeAgo(item.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <audio
                          controls
                          src={item.imagekitUrl}
                          className="w-56 max-w-[180px]"
                        />

                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          className="rounded-lg p-1 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600"
                          aria-label="Download audio"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            Previous
          </button>

          <div className="text-sm text-gray-500">
            Showing {files.length} item{files.length === 1 ? "" : "s"}
          </div>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

