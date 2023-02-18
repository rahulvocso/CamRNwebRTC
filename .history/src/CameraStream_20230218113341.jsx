import React, {useState, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {RTCPeerConnection, RTCView, mediaDevices} from 'react-native-webrtc';
import {RNCamera} from 'react-native-camera';
import RNFetchBlob from 'rn-fetch-blob';

const App = () => {
  const [streamURL, setStreamURL] = useState(null);
  const [isFront, setIsFront] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingPath, setRecordingPath] = useState(null);

  const peerConnection = useRef(null);
  const localStream = useRef(null);
  const recording = useRef(null);

  const toggleCamera = () => {
    setIsFront(!isFront);
  };

  const toggleMic = () => {
    setIsMicEnabled(!isMicEnabled);
    localStream.current.getAudioTracks()[0].enabled = isMicEnabled;
  };

  const toggleCameraEnabled = () => {
    setIsCameraEnabled(!isCameraEnabled);
    localStream.current.getVideoTracks()[0].enabled = isCameraEnabled;
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      const now = new Date().toISOString();
      const recordingName = `recording_${now}.mp4`;
      const path = `${RNFetchBlob.fs.dirs.CacheDir}/${recordingName}`;
      setRecordingPath(path);
      recording.current = new MediaRecorder(localStream.current, {
        mimeType: 'video/mp4',
      });
      recording.current.start();
      setIsRecording(true);
    } else {
      recording.current.stop();
      setIsRecording(false);
      const uri = `file://${recordingPath}`;
      console.log('Video saved to:', uri);
    }
  };

  const onStream = stream => {
    setStreamURL(stream.toURL());
    localStream.current = stream;
  };

  const startStream = async () => {
    const config = {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]};
    peerConnection.current = new RTCPeerConnection(config);
    const devices = await mediaDevices.enumerateDevices();
    const facing = isFront ? 'front' : 'back';
    const constraints = {
      audio: true,
      video: {
        facingMode: {exact: facing},
        width: {min: 640, ideal: 1280},
        height: {min: 480, ideal: 720},
      },
    };
    const stream = await mediaDevices.getUserMedia(constraints);
    stream.getTracks().forEach(track => {
      peerConnection.current.addTrack(track, stream);
    });
    peerConnection.current.ontrack = event => {
      onStream(event.streams[0]);
    };
  };

  const stopStream = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        track.stop();
      });
    }
    setStreamURL(null);
  };

  //const renderCamera = () => {
  return (
    <View style={styles.cameraView}>
      {stream ? (
        <RTCView
          streamURL={streamURL}
          style={styles.videoStream}
          // return (
          //   <View style={{flex: 1}}>
          //     {stream ? (
          //       <RTCView
          //         style={{flex: 1}}
          //         streamURL={stream.toURL()}
          objectFit="cover"
          mirror={!isFront}
        />
      ) : (
        <View style={{flex: 1, backgroundColor: 'black'}} />
      )}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
        }}>
        <TouchableOpacity onPress={toggleMic}>
          <Text style={{color: 'white'}}>{isMicOn ? 'Mic On' : 'Mic Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleCamera}>
          <Text style={{color: 'white'}}>
            {isCameraOn ? 'Camera On' : 'Camera Off'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={switchCamera}>
          <Text style={{color: 'white'}}>{isFront ? 'Front' : 'Back'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={startRecording}>
          <Text style={{color: 'white'}}>Record</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={stopStream}>
          <Text style={{color: 'white'}}>Stop</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CameraScreen;
