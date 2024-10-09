import { useEffect, useRef, useState } from 'react';

export default function VideoStream(props: any) {
  const { width, height }:
    {
      width: number;
      height: number;
    } = props;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  const servers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream; // Set the stream to the video element
      }
    } catch (err) {
      console.error('Error accessing media devices.', err);
    }
  };

  useEffect(() => {
    getMedia();
    // Cleanup function
    return () => {
      stopStreaming();
    }
  }, []);

  // Function to send media stream to backend
  const startStreaming = async () => {
    await getMedia();
    
    // Request access to video and audio
    const pc = new RTCPeerConnection(servers);

    if (!mediaStream) {
      return;
    } else {
      mediaStream.getTracks().forEach(track => pc.addTrack(track, mediaStream));
    }

    // Prepare to send media stream to your Actix route
    const serverUrl = 'http://localhost:8080/video/stream/{room_id}';

    // You can use WebRTC or WebSockets to send the media stream (simplified here)
    // You can set up WebSocket or upload chunks of media here.



    // Set up connection with the Actix signaling server
    const signalingServer = new WebSocket("ws://localhost:8080/ws");
    signalingServer.onmessage = async (message) => {
      const data = JSON.parse(message.data);

      if (data.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        signalingServer.send(JSON.stringify({ answer }));
      }
    };

    // Send ICE candidates to the signaling server
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        signalingServer.send(JSON.stringify({ candidate: event.candidate }));
      }
    };

    setPeerConnection(pc);

    console.log('Streaming to server:', serverUrl);
  };

  const stopStreaming = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      setMediaStream(null);
    }
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
  }

  return (
    <div className='h-full w-full grid grid-cols-3'>
      <div className='col-span-2 w-full h-full flex flex-col items-center'>
        <div className='flex h-full items-center p-3'>
          <video ref={videoRef} autoPlay playsInline muted
            className='w-full h-fit object-contain ring-1 ring-black/10 shadow-lg'
          />
        </div>
      </div>
      <div className='p-4 bg-gray-500 text-white relative'>
        <div className='h-full flex flex-col justify-between'>
          <div>
            <h3 className='text-3xl mb-3'>MediaStream</h3>
            {
              // Log all data from the media stream
              mediaStream &&
              <ul className='text-white flex flex-col gap-y-2'>
                <li className='bg-black p-1'>id: {mediaStream.id}</li>
                <li className='bg-black p-1'>active: {mediaStream.active.toString()}</li>
                <li className='bg-black p-1'>tracks: {mediaStream.getTracks().length}</li>
              </ul>
            }
          </div>
          <div className='flex flex-col gap-y-2 w-full'>
            <button className='cursor-pointer select-none bg-blue-700 rounded text-white px-3 p-2' onClick={startStreaming}>Start Streaming</button>
            <button className='cursor-pointer select-none bg-red-500 rounded text-white px-3 p-2' onClick={stopStreaming}>Stop Streaming</button>
            
          </div>
        </div>
      </div>
    </div>
  );
}
