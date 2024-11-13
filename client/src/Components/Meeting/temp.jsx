import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Camera,
  Mic,
  MonitorUp,
  MoreVertical,
  PhoneOff,
  MicOff,
  VideoOff,
  Copy,
  CameraOff,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import VideoGrid from "./VideoGrid";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const WebRTCMeetingRoom = () => {
  const [localStream, setLocalStream] = useState(null);
  const [peers, setPeers] = useState(() => new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeviceSettingsOpen, setIsDeviceSettingsOpen] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [hasMediaPermissions, setHasMediaPermissions] = useState(false);
  const [availableDevices, setAvailableDevices] = useState({
    audioInputs: [],
    videoInputs: [],
    audioOutputs: [],
  });
  const [selectedDevices, setSelectedDevices] = useState({
    audioInput: "",
    videoInput: "",
    audioOutput: "",
  });

  const localVideoRef = useRef(null);
  const peerConnections = useRef(new Map());
  const socketRef = useRef(null);
  const location = useLocation();
  const { meetingDetails } = location.state;
  console.log(meetingDetails);
  const { currentUser, token } = useSelector((state) => ({
    currentUser: state.user.currentUser,
    token: state.user.token,
  }));

  const logDebug = (message, data = null) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || "");
    setConnectionStatus(`${message} ${data ? JSON.stringify(data) : ""}`);
  };

  const updatePeerState = useCallback((peerId, updates) => {
    setPeers((prevPeers) => {
      const newPeers = new Map(prevPeers);
      const existingPeer = newPeers.get(peerId) || {};
      newPeers.set(peerId, {
        ...existingPeer,
        ...updates,
        id: peerId, // Always ensure ID is set
      });
      logDebug(`Updated peers map:`, {
        peerId,
        totalPeers: newPeers.size,
        updates,
      });
      return newPeers;
    });
  }, []);

  const createPeerConnection = async (peerId, isInitiator = false) => {
    try {
      logDebug(
        `Creating peer connection for: ${peerId}, isInitiator: ${isInitiator}`
      );
      const configuration = {
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:stun1.l.google.com:19302",
            ],
          },
        ],
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnections.current.set(peerId, peerConnection);

      // Set up peer info in state immediately
      updatePeerState(peerId, {
        name: `Participant ${peerId}`,
        isVideoOff: false,
        isMuted: false,
      });

      if (localStream) {
        localStream.getTracks().forEach(track => {
          logDebug(`Adding ${track.kind} track to peer ${peerId}`);
          peerConnection.addTrack(track, localStream);
        });
      }
      
      peerConnection.onconnectionstatechange = () => {
        logDebug(
          `Peer ${peerId} connection state changed:`,
          peerConnection.connectionState
        );
        updatePeerState(peerId, {
          connectionState: peerConnection.connectionState,
        });
      };

      peerConnection.oniceconnectionstatechange = () => {
        logDebug(
          `Peer ${peerId} ICE connection state:`,
          peerConnection.iceConnectionState
        );
        updatePeerState(peerId, {
          iceConnectionState: peerConnection.iceConnectionState,
        });
      };

      peerConnection.onsignalingstatechange = () => {
        logDebug(
          `Peer ${peerId} signaling state:`,
          peerConnection.signalingState
        );
      };

      if (localStream) {
        logDebug(
          `Adding ${
            localStream.getTracks().length
          } local tracks to peer ${peerId}`
        );
        localStream.getTracks().forEach((track) => {
          try {
            const sender = peerConnection.addTrack(track, localStream);
            logDebug(
              `Successfully added ${track.kind} track to peer ${peerId}`,
              {
                trackId: track.id,
                enabled: track.enabled,
                sender: sender.track?.id,
              }
            );
          } catch (error) {
            logDebug(`Error adding track to peer ${peerId}:`, error.message);
          }
        });
      } else {
        logDebug(`No local stream available when creating peer ${peerId}`);
      }

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          logDebug(`Sending ICE candidate to peer ${peerId}:`, {
            type: event.candidate.type,
            protocol: event.candidate.protocol,
            address: event.candidate.address,
          });

          socketRef.current?.emit("ice-candidate", {
            target: peerId,
            candidate: event.candidate,
            from: currentUser.id,
          });
        }
      };
      
      peerConnection.ontrack = (event) => {
        logDebug(`Received track from peer ${peerId}:`, {
          kind: event.track.kind,
          trackId: event.track.id,
          streamId: event.streams[0]?.id,
        });
  
        if (event.streams && event.streams[0]) {
          updatePeerState(peerId, {
            stream: event.streams[0],
            hasVideo: event.track.kind === 'video',
            hasAudio: event.track.kind === 'audio'
          });
  
          event.track.onended = () => {
            logDebug(`Track ended from peer ${peerId}: ${event.track.kind}`);
          };
  
          event.track.onmute = () => {
            logDebug(`Track muted from peer ${peerId}: ${event.track.kind}`);
            updatePeerState(peerId, {
              isMuted: event.track.kind === 'audio',
              isVideoOff: event.track.kind === 'video'
            });
          };
  
          event.track.onunmute = () => {
            logDebug(`Track unmuted from peer ${peerId}: ${event.track.kind}`);
            updatePeerState(peerId, {
              isMuted: event.track.kind === 'audio' ? false : undefined,
              isVideoOff: event.track.kind === 'video' ? false : undefined
            });
          };
        }
      };

      return peerConnection;
    } catch (error) {
      logDebug(`Error creating peer connection: ${error.message}`);
      throw error;
    }
  };

  const createOffer = async (pc, peerId) => {
    try {
      // Ensure all transceivers are set up properly
      if (!pc.getTransceivers().length) {
        pc.addTransceiver('video', { direction: 'sendrecv' });
        pc.addTransceiver('audio', { direction: 'sendrecv' });
      }
  
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });
  
      await pc.setLocalDescription(offer);
      return offer;
    } catch (error) {
      logDebug(`Error creating offer for peer ${peerId}:`, error);
      throw error;
    }
  };

  // Update the socket initialization to properly handle signaling
  const initializeSocket = () => {
    const socket = io("http://localhost:8000/meeting", {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      logDebug("Connected to signaling server");
      socket.emit("joinGroup", {
        groupId: meetingDetails.groupId,
        userId: currentUser.id,
        meetingId: meetingDetails.meetingId,
        userName: currentUser.name,
      });
    });

    socket.on("user-joined", async ({ userId, userName }) => {
      logDebug("New user joined:", userId);
      try {
        const pc = await createPeerConnection(userId, true);
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        socket.emit("offer", {
          target: userId,
          offer: offer,
          from: currentUser.id,
        });
      } catch (error) {
        logDebug(`Error handling user joined: ${error.message}`);
      }
    });

    socket.on("offer", async ({ from, offer }) => {
      logDebug("Received offer from:", from);
      try {
        let pc = peerConnections.current.get(from);
        if (!pc) {
          pc = await createPeerConnection(from, false);
        }
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("answer", {
          target: from,
          answer: answer,
          from: currentUser.id,
        });
      } catch (error) {
        logDebug(`Error handling offer: ${error.message}`);
      }
    });

    socket.on("answer", async ({ from, answer }) => {
      logDebug("Received answer from:", from);
      try {
        const pc = peerConnections.current.get(from);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (error) {
        logDebug(`Error handling answer: ${error.message}`);
      }
    });

    socket.on("ice-candidate", async ({ from, candidate }) => {
      try {
        const pc = peerConnections.current.get(from);
        if (pc) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (error) {
        logDebug(`Error handling ICE candidate: ${error.message}`);
      }
    });

    socket.on("user-left", ({ userId }) => {
      logDebug(`User left: ${userId}`);
      setPeers((prevPeers) => {
        const newPeers = new Map(prevPeers);
        newPeers.delete(userId);
        return newPeers;
      });

      const pc = peerConnections.current.get(userId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(userId);
      }
    });

    socketRef.current = socket;
  };

  const enumarateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(
        (device) => device.kind === "audioinput"
      );
      const videoInputs = devices.filter(
        (device) => device.kind === "videoinput"
      );
      const audioOutputs = devices.filter(
        (device) => device.kind === "audiooutput"
      );

      setAvailableDevices({
        audioInputs,
        videoInputs,
        audioOutputs,
      });

      // Set default devices if not already set
      if (!selectedDevices.audioInput && audioInputs.length) {
        setSelectedDevices((prev) => ({
          ...prev,
          audioInput: audioInputs[0].deviceId,
        }));
      }
      if (!selectedDevices.videoInput && videoInputs.length) {
        setSelectedDevices((prev) => ({
          ...prev,
          videoInput: videoInputs[0].deviceId,
        }));
      }
      if (!selectedDevices.audioOutput && audioOutputs.length) {
        setSelectedDevices((prev) => ({
          ...prev,
          audioOutput: audioOutputs[0].deviceId,
        }));
      }
    } catch (error) {
      logDebug("Error enumerating devices:", error);
    }
  };

  const switchMediaDevice = async (deviceId, kind) => {
    try {
      const constraints = {
        audio: kind === "audioinput" ? { deviceId: { exact: deviceId } } : true,
        video: kind === "videoinput" ? { deviceId: { exact: deviceId } } : true,
      };

      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(newStream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = newStream;
      }

      peerConnections.current.forEach(async (pc) => {
        const senders = pc.getSenders();
        const trackKind = kind === "audioinput" ? "audio" : "video";
        senders.forEach(async (sender) => {
          if (sender.track?.kind === trackKind) {
            const newTrack = newStream
              .getTracks()
              .find((t) => t.kind === trackKind);
            if (newTrack) {
              await sender.replaceTrack(newTrack);
            }
          }
        });
      });

      setSelectedDevices((prev) => ({
        ...prev,
        [kind === "audioinput" ? "audioInput" : "videoInput"]: deviceId,
      }));
    } catch (error) {
      logDebug(`Error switching ${kind}:`, error);
    }
  };

  const initializeMediaDevices = async () => {
    try {
      await enumarateDevices();
      const constraints = {
        video: {
          deviceId: selectedDevices.videoInput
            ? { exact: selectedDevices.videoInput }
            : undefined,
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          deviceId: selectedDevices.audioInput
            ? { exact: selectedDevices.audioInput }
            : undefined,
          echoCancellation: true,
          noiseSuppression: true,
        },
      };

      logDebug("Getting user media with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setLocalStream(stream);
      setHasMediaPermissions(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        await localVideoRef.current.play().catch(e => logDebug("Play error:", e));
      }

      // Update all existing peer connections with the new stream
      peerConnections.current.forEach((pc, peerId) => {
        stream.getTracks().forEach(track => {
          const sender = pc.getSenders().find(s => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track).catch(e => 
              logDebug(`Error replacing track for peer ${peerId}:`, e)
            );
          } else {
            pc.addTrack(track, stream);
          }
        });
      });

      return stream;
    } catch (err) {
      logDebug("Media initialization error:", err.message);
      setHasMediaPermissions(false);
      setConnectionError(`Failed to access media devices: ${err.message}`);
      throw err;
    }
  };

  useEffect(() => {
    const startMeeting = async () => {
      try {
        const stream = await initializeMediaDevices();
        setLocalStream(stream);
        initializeSocket();
      } catch (err) {
        setConnectionError(`Failed to start meeting: ${err.message}`);
      }
    };

    startMeeting();

    return () => cleanupMeeting();
  }, []);

  const cleanupMeeting = useCallback(() => {
    // Cleanup local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      setLocalStream(null);
    }

    // Cleanup peer connections
    peerConnections.current.forEach((pc) => {
      pc.close();
    });
    peerConnections.current.clear();

    // Clear peers state
    setPeers(new Map());

    // Reset error states
    setConnectionError(null);
  }, [localStream]);

  const requestMediaPermissions = async () => {
    await initializeMediaDevices();
  };

  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const leaveMeeting = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    peerConnections.current.forEach((connection) => connection.close());
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    window.location.href = "/dashboard";
  };

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/join/${meetingDetails.meetingId}?password=${meetingDetails.password}`;
    navigator.clipboard.writeText(link);
  };

  const DeviceSettingsDialog = () => (
    <Dialog open={isDeviceSettingsOpen} onOpenChange={setIsDeviceSettingsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Device Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Microphone</label>
            <Select
              value={selectedDevices.audioInput}
              onValueChange={(value) => switchMediaDevice(value, "audioinput")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                {availableDevices.audioInputs.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label ||
                      `Microphone ${device.deviceId.slice(0, 5)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Camera</label>
            <Select
              value={selectedDevices.videoInput}
              onValueChange={(value) => switchMediaDevice(value, "videoinput")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {availableDevices.videoInputs.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Speaker</label>
            <Select
              value={selectedDevices.audioOutput}
              onValueChange={(value) => {
                if (localVideoRef.current?.setSinkId) {
                  localVideoRef.current.setSinkId(value);
                  setSelectedDevices((prev) => ({
                    ...prev,
                    audioOutput: value,
                  }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select speaker" />
              </SelectTrigger>
              <SelectContent>
                {availableDevices.audioOutputs.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label || `Speaker ${device.deviceId.slice(0, 5)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const ControlsBar = () => (
    <div className="bg-gray-800 p-4">
      <div className="flex justify-between items-center max-w-4xl mx-auto">
        <div className="flex space-x-4">
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full"
            disabled={!hasMediaPermissions}
          >
            {isMuted ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant={isVideoOff ? "destructive" : "secondary"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full"
            disabled={!hasMediaPermissions}
          >
            {isVideoOff ? (
              <VideoOff className="w-5 h-5" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </Button>

          <Button
            variant="secondary"
            size="lg"
            onClick={() => setIsDeviceSettingsOpen(true)}
            className="rounded-full"
            disabled={!hasMediaPermissions}
          >
            <Settings className="w-5 h-5" />
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="rounded-full"
            disabled={!hasMediaPermissions}
          >
            <MonitorUp className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex space-x-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setIsDetailsOpen(true)}
            className="rounded-full"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={leaveMeeting}
            className="rounded-full"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {connectionError && (
        <Alert variant="destructive" className="m-4">
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}
      <div className="flex-1 overflow-hidden">
        <VideoGrid
          localStream={localStream}
          peers={peers}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
        />
      </div>
      <ControlsBar />
      <DeviceSettingsDialog />
      {/* Meeting details dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Meeting Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Meeting Name</h3>
              <p>{meetingDetails?.title}</p>
            </div>
            <div>
              <h3 className="font-medium">Meeting ID</h3>
              <p>{meetingDetails?.meetingId}</p>
            </div>
            <div>
              <h3 className="font-medium">Connection Status</h3>
              <p className="text-sm text-gray-500">{connectionStatus}</p>
            </div>
            <div>
              <h3 className="font-medium">Media Permissions</h3>
              <p className="text-sm text-gray-500">
                {hasMediaPermissions
                  ? "Camera and Microphone enabled"
                  : "No media permissions"}
                {!hasMediaPermissions && (
                  <Button
                    variant="link"
                    className="ml-2 p-0"
                    onClick={requestMediaPermissions}
                  >
                    Enable
                  </Button>
                )}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Participants ({peers.size + 1})</h3>
              <div className="mt-2">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                    {currentUser?.name?.[0] || "Y"}
                  </div>
                  <span>
                    {currentUser?.name || "You"} {isHost ? "(Host)" : ""}
                  </span>
                  <div className="ml-auto flex items-center">
                    {isMuted && (
                      <MicOff className="w-4 h-4 text-gray-500 mr-2" />
                    )}
                    {isVideoOff && (
                      <VideoOff className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
                {Array.from(peers.values()).map((peer) => (
                  <div key={peer.id} className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                      {peer.name?.[0] || "P"}
                    </div>
                    <span>
                      {peer.name || "Participant"} {peer.isHost ? "(Host)" : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium">Meeting Link</h3>
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/join/${meetingDetails.meetingId}?password=${meetingDetails.password}`}
                  className="flex-1 p-2 border rounded-l-md bg-gray-50"
                />
                <Button
                  variant="secondary"
                  onClick={copyMeetingLink}
                  className="rounded-l-none"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WebRTCMeetingRoom;