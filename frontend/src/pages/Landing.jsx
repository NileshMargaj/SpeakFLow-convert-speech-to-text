import React, { useCallback, useEffect, useState } from "react";
import { Target, File, Zap } from 'lucide-react'
import UploadAudio from "../components/UploadAudio";
import RecordAudio from "../components/RecordAudio";
import Transcription from "../components/Transcription";
import RecentTranscriptions from "../components/RecentTranscriptions";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Landing() {
    const [currentTranscript, setCurrentTranscript] = useState({
        id: null,
        text: '',
    });
    const [history, setHistory] = useState([]);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');

    const fetchHistory = useCallback(async () => {
        setIsHistoryLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/transcription/history?limit=5`, {
                credentials: 'include',
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to load transcription history');
            }

            setHistory(data.history || []);
        } catch (error) {
            setStatusMessage(error.message);
        } finally {
            setIsHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const transcribeAudio = async (type, id) => {
        setIsTranscribing(true);
        setStatusMessage('Generating transcription...');

        try {
            const path =
                type === 'recorded'
                    ? `/api/transcription/transcribe/recorded/${id}`
                    : `/api/transcription/transcribe/uploaded/${id}`;

            const response = await fetch(`${API_URL}${path}`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Transcription failed');
            }

            setCurrentTranscript({
                id: data.audioTranscriptId,
                text: data.transcript || '',
            });
            setStatusMessage('Transcription ready');
            await fetchHistory();
        } catch (error) {
            setStatusMessage(error.message);
        } finally {
            setIsTranscribing(false);
        }
    };

    const handleUploadedAudio = ({ audioId }) => {
        transcribeAudio('uploaded', audioId);
    };

    const handleRecordedAudio = ({ recordedAudioId }) => {
        transcribeAudio('recorded', recordedAudioId);
    };

    const handleSelectHistory = (item) => {
        setCurrentTranscript({
            id: item.audioTranscriptId,
            text: item.transcriptText || '',
        });
        setStatusMessage('');
    };

    const handleDownloadPdf = async (transcriptId) => {
        if (!transcriptId) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/transcription/download/${transcriptId}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to download PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
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
            <div className="flex h-full min-h-0 w-full flex-col gap-3">
                <div className="flex items-end justify-between gap-4">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-100 bg-violet-50/60 px-3 py-1">
                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-violet-600" />
                            <span className="text-xs font-medium text-indigo-700">
                                AI Speech to Text
                            </span>
                        </div>

                        <h2 className="mt-2 text-2xl font-bold tracking-tight">
                            Convert Audio to
                            <span className="text-indigo-700"> Text</span>
                        </h2>

                        <p className="mt-1 text-sm leading-relaxed text-gray-600">
                            Upload an audio file or record directly to get started.
                        </p>
                    </div>
                </div>

                <div className="grid w-full grid-cols-1 gap-3 lg:grid-cols-2">
                    <UploadAudio onUploaded={handleUploadedAudio} isProcessing={isTranscribing} />
                    <RecordAudio onRecorded={handleRecordedAudio} isProcessing={isTranscribing} />
                </div>

                <div className="grid min-h-0 w-full flex-1 grid-cols-1 gap-3 lg:grid-cols-2">
                    <Transcription
                        text={currentTranscript.text}
                        transcriptId={currentTranscript.id}
                        isLoading={isTranscribing}
                        statusMessage={statusMessage}
                        onDownload={handleDownloadPdf}
                    />
                    <RecentTranscriptions
                        items={history}
                        isLoading={isHistoryLoading}
                        onSelect={handleSelectHistory}
                        onDownload={handleDownloadPdf}
                    />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                        <div className="text-indigo-500">
                            <Target size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-bold">High Accuracy</div>
                            <div className="mt-0.5 text-xs text-gray-500">With Advanced AI</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
                        <div className="text-indigo-500">
                            <File size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-bold">Multi Formats</div>
                            <div className="mt-0.5 text-xs text-gray-500">Supports mp3, wav and more</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3">
                        <div className="text-indigo-500">
                            <Zap size={20} />
                        </div>
                        <div>
                            <div className="text-sm font-bold">Fast Processing</div>
                            <div className="mt-0.5 text-xs text-gray-500">History & saved files</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
