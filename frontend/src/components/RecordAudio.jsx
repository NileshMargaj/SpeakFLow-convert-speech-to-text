import React, { useEffect, useRef, useState } from 'react';
import { Mic } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const waveformBars = Array.from({ length: 20 }, (_, index) => 12 + ((index * 17) % 38));

const RecordAudio = ({ onRecorded, isProcessing }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [message, setMessage] = useState('');
  const [recordedAudio, setRecordedAudio] = useState(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (!isRecording) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isRecording]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const formattedTime = new Date(seconds * 1000).toISOString().slice(11, 19);

  const uploadRecording = async (blob) => {
    setIsUploading(true);
    setMessage('');
    setRecordedAudio(null);

    try {
      const extension = blob.type.includes('ogg') ? 'ogg' : 'webm';
      const file = new File([blob], `recording-${Date.now()}.${extension}`, {
        type: blob.type || 'audio/webm',
      });
      const formData = new FormData();
      formData.append('recording', file);

      const response = await fetch(`${API_URL}/api/upload/upload-recording`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Recording upload failed');
      }

      setRecordedAudio({
        recordedAudioId: data.recordedAudioId,
        url: data.url,
      });
      setMessage(data.message || 'Recording uploaded successfully');
      onRecorded?.({ recordedAudioId: data.recordedAudioId, url: data.url });
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const startRecording = async () => {
    setMessage('');
    setRecordedAudio(null);
    setSeconds(0);

    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error('Audio recording is not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      streamRef.current = stream;
      chunksRef.current = [];
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (!blob.size) {
          setMessage('No audio was recorded');
          return;
        }

        uploadRecording(blob);
      };

      recorder.start();
      setIsRecording(true);
    } catch (error) {
      setMessage(error.message || 'Microphone permission denied');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRecordClick = () => {
    if (isUploading) {
      return;
    }

    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex h-full w-full items-stretch bg-gray-50">
      <div className="w-full rounded-xl border border-gray-100 bg-white p-4 shadow-md">
        
        {/* Header Section */}
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-400 text-white shadow-lg shadow-rose-100">
            <Mic size={22} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">Record Audio</h2>
            <p className="text-sm text-slate-500">Record your voice and convert to text</p>
          </div>
        </div>

        {/* Recording Interface */}
        <div className="relative flex min-h-[112px] items-center justify-between overflow-hidden rounded-xl border border-slate-100 px-4 py-4">
          
          {/* Timer and Status */}
          <div className="z-10">
            <div className="text-lg font-bold tracking-wider text-slate-800">
              {formattedTime}
            </div>
            <p className="mt-1 text-sm text-slate-400">
              {isUploading ? 'Uploading recording...' : isProcessing ? 'Transcribing...' : isRecording ? 'Recording...' : 'Ready to record'}
            </p>
          </div>

          {/* Waveform Visualization Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="flex items-center gap-1">
              {waveformBars.map((height, i) => (
                <div 
                  key={i} 
                  className={`w-1 bg-slate-400 rounded-full transition-all duration-300 ${isRecording ? 'animate-pulse' : ''}`}
                  style={{ height: `${height}px` }}
                />
              ))}
            </div>
          </div>

          {/* Record Button */}
          <button 
            onClick={handleRecordClick}
            disabled={isUploading}
            className="relative z-10 group disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* Outer Glow/Pulse */}
            <div className={`absolute -inset-3 bg-rose-400 rounded-full opacity-20 transition-all duration-500 
              ${isRecording ? 'animate-ping' : 'group-hover:scale-110'}`} 
            />
            
            {/* Button Body */}
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-rose-500 shadow-md">
              <div className={`bg-white transition-all duration-300 ${isRecording ? 'h-4 w-4 rounded-sm' : 'h-5 w-5 rounded-full'}`} />
            </div>
          </button>

        </div>

        {message && (
          <p className={`mt-3 rounded-lg px-3 py-2 text-sm font-medium ${
            recordedAudio ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}>
            {message}
          </p>
        )}

        {recordedAudio?.recordedAudioId && (
          <div className="mt-2 text-xs text-slate-500">
            Recording ID: <span className="font-semibold text-slate-700">{recordedAudio.recordedAudioId}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordAudio;
