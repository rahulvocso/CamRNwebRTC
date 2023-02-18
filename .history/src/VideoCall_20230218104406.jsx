import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, TouchableOpacity} from 'react-native';
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  mediaDevices,
  RTCView,
} from 'react-native-webrtc';

//import io from 'socket.io-client';

// const socket = io('https://my-video-chat-app.com');
//const socket = io.connect('http://localhost:3000');

// const socket = io.connect('http://localhost:5151', {
//   'Access-Control_allow_origin': '*',
//   'force new connection': true,
//   reconnectionAttempts: 'Infinity',
//   timeout: 1000,
//   transports: ['websocket', 'polling', 'flashsocket'],
//   cors: {
//     origin: 'https://localhost:3000',
//     methods: ['GET', 'POST'],
//     credentials: true,
//   },
// });

const VideoCall = () => {
  const [meetingId, setMeetingId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [cameraType, setCameraType] = useState('front');
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    // Get the user's camera and microphone
    mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
        // {
        //   facingMode: cameraType,
        // },
      })
      .then(stream => {
        setLocalStream(stream);
        localStreamRef.current = stream;
      });
  }, [cameraType]);

  // Join the meeting when the user clicks the "Join Meeting" button
  // const handleJoinMeeting = () => {
  //   // Join the meeting with the specified meeting ID
  //   socket.emit('join-meeting', meetingId);

  //   // Listen for signaling messages from the signaling server
  //   socket.on('signaling-message', async message => {
  //     switch (message.type) {
  //       case 'offer':
  //         await handleOffer(message);
  //         break;
  //       case 'answer':
  //         await handleAnswer(message);
  //         break;
  //       case 'ice-candidate':
  //         handleIceCandidate(message);
  //         break;
  //     }
  //   });
  // };

  // Start the call when the user clicks the "Start Call" button
  // const handleStartCall = async () => {
  //   // Create a new peer connection
  //   const peerConnection = new RTCPeerConnection({
  //     iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
  //   });
  //   peerConnectionRef.current = peerConnection;

  //   // Add the user's local stream to the peer connection
  //   localStreamRef.current
  //     .getTracks()
  //     .forEach(track => peerConnection.addTrack(track, localStreamRef.current));

  //   // Listen for ICE candidates and send them to the remote peer
  //   peerConnection.addEventListener('icecandidate', event => {
  //     if (event.candidate) {
  //       socket.emit('signaling-message', {
  //         type: 'ice-candidate',
  //         candidate: event.candidate,
  //         meetingId,
  //       });
  //     }
  //   });

    // Create an offer and send it to the remote peer
  //   const offer = await peerConnection.createOffer();
  //   await peerConnection.setLocalDescription(offer);
  //   socket.emit('signaling-message', {
  //     type: 'offer',
  //     offer,
  //     meetingId,
  //   });
  // };

  // Handle an incoming offer from the remote peer
  // const handleOffer = async message => {
  //   // Create a new peer connection
  //   const peerConnection = new RTCPeerConnection({
  //     iceServers: [{urls: 'stun:stun.l.google.com:19302'}],
  //   });
  //   peerConnectionRef.current = peerConnection;

    // Add the user's local stream to the peer

    // ////// // break

    localStreamRef.current
      .getTracks()
      .forEach(track => peerConnection.addTrack(track, localStreamRef.current));

    // Listen for ICE candidates and send them to the remote peer
    peerConnection.addEventListener('icecandidate', event => {
      if (event.candidate) {
        socket.emit('signaling-message', {
          type: 'ice-candidate',
          candidate: event.candidate,
          meetingId,
        });
      }
    });

    // Set the remote description and create an answer to send back to the remote peer
    await peerConnection.setRemoteDescription(
      new RTCSessionDescription(message.offer),
    );
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // Send the answer back to the remote peer
    socket.emit('signaling-message', {
      type: 'answer',
      answer,
      meetingId,
    });

    // Listen for the remote stream and set it to the state
    peerConnection.addEventListener('track', event => {
      setRemoteStream(event.streams[0]);
    });
  };

  // Handle an incoming answer from the remote peer
  const handleAnswer = async message => {
    await peerConnectionRef.current.setRemoteDescription(
      new RTCSessionDescription(message.answer),
    );
  };

  // Handle an incoming ICE candidate from the remote peer
  const handleIceCandidate = message => {
    const candidate = new RTCIceCandidate(message.candidate);
    peerConnectionRef.current.addIceCandidate(candidate);
  };

  // Switch between front and back camera when the user clicks the "Switch Camera" button
  const handleSwitchCamera = () => {
    setCameraType(cameraType === 'front' ? 'back' : 'front');
  };

  // Toggle the microphone on/off when the user clicks the "Toggle Microphone" button
  const handleToggleMic = () => {
    localStreamRef.current.getAudioTracks().forEach(track => {
      track.enabled = !micEnabled;
    });
    setMicEnabled(!micEnabled);
  };

  // Toggle the camera on/off when the user clicks the "Toggle Camera" button
  const handleToggleCamera = () => {
    localStreamRef.current.getVideoTracks().forEach(track => {
      track.enabled = !cameraEnabled;
    });
    setCameraEnabled(!cameraEnabled);
  };

  // End the call when the user clicks the "End Call" button
  const handleEndCall = () => {
    peerConnectionRef.current.close();
    setLocalStream(null);
    setRemoteStream(null);
    setIsCalling(false);
    setCallEnded(true);
  };

  return (
    <View>
      {!isCalling && !callEnded && (
        <View>
          <TextInput
            value={meetingId}
            onChangeText={setMeetingId}
            placeholder=" Enter Meeting ID"
          />
          <TouchableOpacity onPress={handleJoinMeeting}>
            <Text> Join Meeting</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleStartCall}>
            <Text> Start Call</Text>
          </TouchableOpacity>
        </View>
      )}
      {isCalling && !callEnded && (
        <View>
          <View style={{flex: 1, flexDirection: 'row'}}>
            <RTCView streamURL={localStream.toURL()} style={{flex: 1}} />
            <RTCView streamURL={remoteStream.toURL()} style={{flex: 1}} />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <TouchableOpacity onPress={handleToggleMic}>
              <Text>{micEnabled ? 'Turn Off Mic' : 'Turn On Mic'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleToggleCamera}>
              <Text>
                {cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSwitchCamera}>
              <Text>Switch Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEndCall}>
              <Text>End Call</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {callEnded && (
        <View>
          <Text>Call ended</Text>
          <TouchableOpacity
            onPress={() => {
              setCallEnded(false);
            }}>
            <Text>Start new call</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default VideoCall;
