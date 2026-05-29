import React, { useCallback, useEffect, useState } from "react";
import RecentTranscriptions from "../components/RecentTranscriptions";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function History() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch(
        `${API_URL}/api/transcription/history?page=${page}&limit=${limit}`,
        { credentials: "include" }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load transcription history");
      }

      setItems(data.history || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSelectHistory = () => {
    // History page currently focuses on browsing. Selecting a row on this page
    // does not navigate to the transcription viewer.
  };

  const handleDownloadPdf = async (transcriptId) => {
    if (!transcriptId) return;

    try {
      const response = await fetch(
        `${API_URL}/api/transcription/download/${transcriptId}`,
        { credentials: "include" }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `speakflow-transcription-${transcriptId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  return (
    <div className="h-full min-h-0 w-full overflow-hidden p-1">
      <div className="flex h-full min-h-0 w-full flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              History
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Browse your previous transcriptions.
            </p>
          </div>

          <div className="text-right">
            {statusMessage ? (
              <p className="text-sm font-medium text-red-600">{statusMessage}</p>
            ) : (
              <p className="text-sm font-medium text-gray-500">
                Page {page} of {totalPages}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <RecentTranscriptions
            items={items}
            isLoading={isLoading}
            onSelect={handleSelectHistory}
            onDownload={handleDownloadPdf}
          />
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
            Showing {items.length} item{items.length === 1 ? "" : "s"}
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

