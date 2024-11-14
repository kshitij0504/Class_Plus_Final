import React, { useRef, useState, useEffect } from 'react';

function VoiceChatWithWaveform({ socket }) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    // Initialize Audio Context and Analyzer
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 2048; // Higher values for more smoothness
  }, []);

  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    setMediaRecorder(recorder);
    const source = audioContextRef.current.createMediaStreamSource(stream);
    source.connect(analyserRef.current);

    recorder.start();

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        setAudioChunks((prev) => [...prev, e.data]);
        socket.emit('voiceData', e.data); // Send audio data to server
      }
    };

    recorder.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
    };

    animateWaveform(); // Start drawing waveform
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorder.stop();
    setAudioChunks([]);
  };

  const animateWaveform = () => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      analyserRef.current.getByteTimeDomainData(dataArray);

      // Clear the canvas with grey background and draw waveform in white
      canvasCtx.fillStyle = 'rgba(50, 50, 50, 1)'; // Grey background
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#ffffff'; // White waveform color
      canvasCtx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();

      requestAnimationFrame(draw); // Continue animating
    };
    draw(); // Start drawing the waveform
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-gray-800 rounded-lg shadow-md">
      <canvas
        ref={canvasRef}
        width="400"
        height="100"
        className="bg-gray-600 rounded shadow-lg"
      />
      <div>
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Stop Recording
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Recording
          </button>
        )}
      </div>
    </div>
  );
}

export default VoiceChatWithWaveform;
