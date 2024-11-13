import React, { useEffect, useRef } from "react";
import { User, MicOff, VideoOff } from "lucide-react";

const VideoGrid = ({ localStream, peers, isMuted, isVideoOff, localVideoRef }) => {
  // Calculate optimal grid layout
  const calculateLayout = (participantCount) => {
    if (participantCount === 1) return { rows: 1, cols: 1 };
    if (participantCount === 2) return { rows: 1, cols: 2 };
    if (participantCount <= 4) return { rows: 2, cols: 2 };
    if (participantCount <= 6) return { rows: 2, cols: 3 };
    if (participantCount <= 9) return { rows: 3, cols: 3 };
    return { rows: Math.ceil(Math.sqrt(participantCount)), cols: Math.ceil(Math.sqrt(participantCount)) };
  };

  const VideoParticipant = ({ stream, isLocal, userName, isMutedState, isVideoOffState }) => {
    const videoRef = isLocal ? localVideoRef : useRef(null);
    const { rows, cols } = calculateLayout(peers.size + 1);
    
    useEffect(() => {
      const setupVideo = async () => {
        if (!videoRef.current || !stream) return;
        
        try {
          // Ensure stream tracks are enabled
          stream.getTracks().forEach(track => {
            if (track.kind === 'video') {
              track.enabled = !isVideoOffState;
            }
            if (track.kind === 'audio') {
              track.enabled = !isMutedState;
            }
          });

          // Set srcObject only if it's different
          if (videoRef.current.srcObject !== stream) {
            videoRef.current.srcObject = stream;
          }

          // Only play if not already playing and not local
          if (!isLocal && videoRef.current.paused) {
            // Use play() with error handling
            try {
              await videoRef.current.play();
            } catch (err) {
              console.error("Error playing video:", err);
              // Retry play with user interaction if needed
              if (err.name === "NotAllowedError") {
                const playPromise = videoRef.current.play();
                if (playPromise !== undefined) {
                  playPromise.catch(() => {
                    // Add click-to-play functionality
                    videoRef.current.addEventListener('click', () => {
                      videoRef.current.play();
                    }, { once: true });
                  });
                }
              }
            }
          }
        } catch (error) {
          console.error("Error setting up video:", error);
        }
      };

      setupVideo();

      // Cleanup
      return () => {
        if (!isLocal && videoRef.current) {
          videoRef.current.srcObject = null;
        }
      };
    }, [stream, isLocal, isVideoOffState, isMutedState]);

    return (
      <div 
        className="relative"
        style={{
          width: `${100 / cols}%`,
          height: `${100 / rows}%`,
          minWidth: "200px",
          minHeight: "150px"
        }}
      >
        <div className="absolute inset-0 m-1 rounded-lg overflow-hidden bg-gray-800">
          {/* Video element */}
          {stream && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isLocal}
              className={`w-full h-full object-cover ${
                (isLocal ? isVideoOff : isVideoOffState) ? 'hidden' : 'block'
              }`}
            />
          )}

          {/* Avatar placeholder */}
          {((isLocal ? isVideoOff : isVideoOffState) || !stream) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
                <User className="w-12 h-12 text-gray-300" />
              </div>
            </div>
          )}

          {/* User info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-between">
              <span className="text-white text-sm font-medium">
                {isLocal ? 'You' : (userName || 'Participant')}
              </span>
              <div className="flex space-x-2">
                {(isLocal ? isMuted : isMutedState) && (
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <MicOff className="w-4 h-4 text-white" />
                  </div>
                )}
                {(isLocal ? isVideoOff : isVideoOffState) && (
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <VideoOff className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full bg-gray-900 flex flex-wrap">
      {/* Local participant */}
      <VideoParticipant
        stream={localStream}
        isLocal={true}
        isMutedState={isMuted}
        isVideoOffState={isVideoOff}
      />

      {/* Remote participants */}
      {Array.from(peers.entries()).map(([peerId, peer]) => (
        <VideoParticipant
          key={peerId}
          stream={peer.stream}
          isLocal={false}
          userName={peer.name}
          isMutedState={peer.hasAudio === false}
          isVideoOffState={peer.hasVideo === false}
        />
      ))}
    </div>
  );
};

export default VideoGrid;