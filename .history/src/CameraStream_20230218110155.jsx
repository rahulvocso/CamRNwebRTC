import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {RTCView, MediaStream, MediaStreamTrack} from 'react-native-webrtc';

const CameraScreen = () => {
  const [stream, setStream] = (useState < MediaStream) | (null > null);
  const [isFront, setIsFront] = useState < boolean > true;
  const [isCameraOn, setIsCameraOn] = useState < boolean > true;
  const [isMicOn, setIsMicOn] = useState < boolean > true;

  useEffect(() => {
    // Get user media stream
    const getMediaStream = async () => {
      const constraints = {audio: true, video: true};
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
    };
    getMediaStream();

    // Clean up stream when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);

  const switchCamera = () => {
    setIsFront(!isFront);
  };

  const toggleCamera = () => {
    setIsCameraOn(!isCameraOn);
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const startRecording = () => {
    // TODO: Implement video recording logic
  };

  const stopStream = () => {
    setStream(null);
  };

  return (
    <View style={{flex: 1}}>
      {stream ? (
        <RTCView
          style={{flex: 1}}
          streamURL={stream.toURL()}
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
