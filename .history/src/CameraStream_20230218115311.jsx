import React, {useState, useEffect} from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import {
  RTCView,
  MediaStream,
  MediaStreamConstraints,
  mediaDevices,
} from 'react-native-webrtc';
import RNFetchBlob from 'rn-fetch-blob';

const CameraStream = () => {
  const [stream, setStream] = useState();
  const [streaming, setStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    return () => {
      if (stream) {
        stream.release();
      }
    };
  }, [stream]);

  const startStreaming = async () => {
    const isFront = true;
    const facingMode = isFront ? 'user' : 'environment';
    const constraints = {
      audio: true,
      video: {
        facingMode,
        width: 640,
        height: 480,
      },
    };
    const newStream = await mediaDevices.getUserMedia(constraints);
    setStream(newStream);
    setStreaming(true);
  };

  const stopStreaming = () => {
    if (stream) {
      stream.release();
    }
    setStream(null);
    setStreaming(false);
  };

  const toggleRecording = () => {
    if (recording) {
      setRecording(false);
      setVideoUrl('');
    } else {
      setRecording(true);
    }
  };

  const saveRecording = async data => {
    const dirs = RNFetchBlob.fs.dirs;
    const filePath = `${dirs.CacheDir}/recorded_video.mp4`;
    await RNFetchBlob.fs.writeFile(filePath, data, 'base64');
    setVideoUrl(`file://${filePath}`);
  };

  const onNewFrame = data => {
    if (recording) {
      saveRecording(data);
    }
  };

  return (
    <View style={{flex: 1}}>
      {!streaming ? (
        <TouchableOpacity onPress={startStreaming}>
          <Text style={{fontSize: 20}}>Start Camera Stream</Text>
        </TouchableOpacity>
      ) : (
        <View style={{flex: 1}}>
          <RTCView
            streamURL={stream?.toURL()}
            style={{flex: 1}}
            objectFit="cover"
            onFrame={onNewFrame}
          />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity style={{padding: 10}} onPress={toggleRecording}>
              <Text style={{fontSize: 20}}>
                {recording ? 'Stop Recording' : 'Record Video'}
              </Text>
            </TouchableOpacity>
            {recording && (
              <Text style={{fontSize: 16}}>{'Recording in progress...'}</Text>
            )}
          </View>
          <TouchableOpacity style={{padding: 10}} onPress={stopStreaming}>
            <Text style={{fontSize: 20}}>Stop Camera Stream</Text>
          </TouchableOpacity>
        </View>
      )}
      {videoUrl !== '' && (
        <Video
          source={{uri: videoUrl}}
          style={{width: 400, height: 400}}
          controls={true}
        />
      )}
    </View>
  );
};

export default CameraStream;
