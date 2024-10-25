// import React, { useRef, useEffect } from 'react';
// import { CameraOff, MicOff, VideoOff } from 'lucide-react';

// // Individual video participant component
// const VideoParticipant = ({ stream, isLocal, name, isMuted, isVideoOff }) => {
//   console.log(stream)
//   console.log(isLocal)
//   console.log(name)
//   console.log(isMuted)
//   console.log(isVideoOff)
//   const videoRef = useRef(null);

//   useEffect(() => {
//     if (videoRef.current && stream) {
//       videoRef.current.srcObject = stream;
//       // Autoplay with error handling
//       videoRef.current.play().catch(err => 
//         console.error('Error playing video:', err)
//       );
//     }
//   }, [stream]);

//   return (
//     <div className="relative w-full h-full">
//       <div className="absolute inset-0 bg-gray-900 rounded-lg overflow-hidden">
//         {stream && !isVideoOff ? (
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             muted={isLocal}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center bg-gray-800">
//             <CameraOff className="w-12 h-12 text-gray-400" />
//           </div>
//         )}
        
//         {/* Status overlay */}
//         <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
//           <div className="flex items-center justify-between">
//             <span className="text-white text-sm font-medium truncate">
//               {name} {isLocal && "(You)"}
//             </span>
//             <div className="flex space-x-2">
//               {isMuted && (
//                 <div className="bg-red-500/20 p-1 rounded-full">
//                   <MicOff className="w-4 h-4 text-red-500" />
//                 </div>
//               )}
//               {isVideoOff && (
//                 <div className="bg-red-500/20 p-1 rounded-full">
//                   <VideoOff className="w-4 h-4 text-red-500" />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Main video grid component
// const VideoGrid = ({ localStream, peers, isMuted, isVideoOff }) => {
//   const totalParticipants = peers.size + 1;
  
//   // Dynamic grid layout based on participant count
//   const getGridClass = () => {
//     switch (totalParticipants) {
//       case 1:
//         return "grid-cols-1";
//       case 2:
//         return "grid-cols-1 md:grid-cols-2";
//       case 3:
//       case 4:
//         return "grid-cols-2";
//       default:
//         return "grid-cols-2 lg:grid-cols-3";
//     }
//   };

//   return (
//     <div className="w-full h-full p-4 bg-gray-900">
//       <div className={`grid ${getGridClass()} gap-4 auto-rows-fr h-full`}>
//         {/* Local participant */}
//         <div className="relative aspect-video">
//           <VideoParticipant
//             stream={localStream}
//             isLocal={true}
//             name="You"
//             isMuted={isMuted}
//             isVideoOff={isVideoOff}
//           />
//         </div>

//         {/* Remote participants */}
//         {Array.from(peers.entries()).map(([peerId, peer]) => (
//           <div key={peerId} className="relative aspect-video">
//             <VideoParticipant
//               stream={peer.stream}
//               isLocal={false}
//               name={peer.name || `Participant ${peerId}`}
//               isMuted={peer.isMuted}
//               isVideoOff={peer.isVideoOff}
//             />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default VideoGrid;

// VideoParticipant.jsx component (extract this from VideoGrid for better organization)
// import React, { useEffect, useRef, useState } from 'react';
// import { Camera, CameraOff, Mic, MicOff } from 'lucide-react';

// const VideoParticipant = ({ stream, isLocal, name, localIsVideoOff = false }) => {
//   console.log(stream)
//   console.log(isLocal)
//   console.log(name)
//   console.log(localIsVideoOff)
//   const videoRef = useRef(null);
//   const [videoActive, setVideoActive] = useState(false);
//   const [audioActive, setAudioActive] = useState(false);

//   useEffect(() => {
//     if (!videoRef.current || !stream) return;

//     // Set stream to video element
//     videoRef.current.srcObject = stream;
    
//     // Check initial track states
//     const videoTrack = stream.getVideoTracks()[0];
//     const audioTrack = stream.getAudioTracks()[0];
    
//     const updateTrackStates = () => {
//       if (videoTrack) {
//         setVideoActive(videoTrack.enabled && videoTrack.readyState === 'live');
//       }
//       if (audioTrack) {
//         setAudioActive(audioTrack.enabled && audioTrack.readyState === 'live');
//       }
//     };

//     // Initial state update
//     updateTrackStates();

//     // Track state change listeners
//     const trackEventHandlers = new Map();
    
//     if (videoTrack) {
//       const videoHandler = () => updateTrackStates();
//       trackEventHandlers.set(videoTrack, videoHandler);
      
//       videoTrack.addEventListener('enabled', videoHandler);
//       videoTrack.addEventListener('disabled', videoHandler);
//       videoTrack.addEventListener('ended', videoHandler);
//       videoTrack.addEventListener('mute', videoHandler);
//       videoTrack.addEventListener('unmute', videoHandler);
//     }

//     if (audioTrack) {
//       const audioHandler = () => updateTrackStates();
//       trackEventHandlers.set(audioTrack, audioHandler);
      
//       audioTrack.addEventListener('enabled', audioHandler);
//       audioTrack.addEventListener('disabled', audioHandler);
//       audioTrack.addEventListener('ended', audioHandler);
//       audioTrack.addEventListener('mute', audioHandler);
//       audioTrack.addEventListener('unmute', audioHandler);
//     }

//     // Cleanup function
//     return () => {
//       if (videoTrack) {
//         const videoHandler = trackEventHandlers.get(videoTrack);
//         videoTrack.removeEventListener('enabled', videoHandler);
//         videoTrack.removeEventListener('disabled', videoHandler);
//         videoTrack.removeEventListener('ended', videoHandler);
//         videoTrack.removeEventListener('mute', videoHandler);
//         videoTrack.removeEventListener('unmute', videoHandler);
//       }
      
//       if (audioTrack) {
//         const audioHandler = trackEventHandlers.get(audioTrack);
//         audioTrack.removeEventListener('enabled', audioHandler);
//         audioTrack.removeEventListener('disabled', audioHandler);
//         audioTrack.removeEventListener('ended', audioHandler);
//         audioTrack.removeEventListener('mute', audioHandler);
//         audioTrack.removeEventListener('unmute', audioHandler);
//       }
//     };
//   }, [stream]);

//   // For local video, use the localIsVideoOff prop directly
//   const shouldShowVideo = isLocal ? !localIsVideoOff : videoActive;

//   return (
//     <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
//       {shouldShowVideo ? (
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted={isLocal}
//           className="w-full h-full object-cover"
//         />
//       ) : (
//         <div className="w-full h-full flex items-center justify-center bg-gray-700">
//           <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
//             <span className="text-2xl text-white">
//               {name?.[0]?.toUpperCase() || '?'}
//             </span>
//           </div>
//         </div>
//       )}
      
//       {/* Status overlay */}
//       <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2">
//         <div className="flex items-center justify-between">
//           <span className="text-white text-sm">{isLocal ? 'You' : name}</span>
//           <div className="flex space-x-2">
//             {!audioActive && (
//               <MicOff className="w-4 h-4 text-red-500" />
//             )}
//             {!shouldShowVideo && (
//               <CameraOff className="w-4 h-4 text-red-500" />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Updated VideoGrid component
// const VideoGrid = ({ localStream, peers, isMuted, isVideoOff }) => {
//   const totalParticipants = peers.size + 1;
//   const gridCols = totalParticipants <= 1 ? 1 : 
//                    totalParticipants <= 4 ? 2 : 
//                    totalParticipants <= 9 ? 3 : 4;

//   return (
//     <div className="h-full p-4 bg-gray-900">
//       <div 
//         className="grid gap-4 h-full"
//         style={{
//           gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
//           gridAutoRows: `calc((100% - ${(Math.ceil(totalParticipants / gridCols) - 1) * 1}rem) / ${Math.ceil(totalParticipants / gridCols)})`
//         }}
//       >
//         {/* Local participant */}
//         <VideoParticipant
//           stream={localStream}
//           isLocal={true}
//           name="You"
//           localIsVideoOff={isVideoOff}
//         />
        
//         {/* Remote participants */}
//         {Array.from(peers.entries()).map(([peerId, peer]) => (
//           <VideoParticipant
//             key={peerId}
//             stream={peer.stream}
//             name={peer.name || `Participant ${peerId.slice(0, 5)}`}
//             isLocal={false}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default VideoGrid;

import React, { useEffect, useRef } from 'react';

const VideoGrid = ({ localStream, peers, isMuted, isVideoOff }) => {
  const localVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      // Mute local video to prevent echo
      localVideoRef.current.muted = true;
    }
  }, [localStream]);

  const gridClassName = `grid gap-4 p-4 h-full ${
    peers.size === 0 ? 'grid-cols-1' :
    peers.size === 1 ? 'grid-cols-2' :
    peers.size === 2 ? 'grid-cols-2' :
    'grid-cols-3'
  }`;

  return (
    <div className={gridClassName}>
      {/* Local Video */}
      <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : ''}`}
        />
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
            <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-2xl text-white">
              You
            </div>
          </div>
        )}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
          You {isMuted && '(Muted)'}
        </div>
      </div>

      {/* Remote Videos */}
      {Array.from(peers.entries()).map(([peerId, peer]) => (
        <div key={peerId} className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
          {peer.stream ? (
            <RemoteVideo stream={peer.stream} isVideoOff={peer.isVideoOff} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
              <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-2xl text-white">
                {peer.name?.[0] || 'P'}
              </div>
            </div>
          )}
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm">
            {peer.name || `Participant ${peerId}`} {peer.isMuted && '(Muted)'}
          </div>
        </div>
      ))}
    </div>
  );
};

const RemoteVideo = ({ stream, isVideoOff }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      
      const playVideo = async () => {
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error('Error playing remote video:', err);
          // Retry playing after a short delay
          setTimeout(playVideo, 1000);
        }
      };
      
      playVideo();
    }
  }, [stream]);

  if (isVideoOff) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
        <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center text-2xl text-white">
          P
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />
  );
};

export default VideoGrid;