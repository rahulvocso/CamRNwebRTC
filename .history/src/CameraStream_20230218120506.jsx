import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, PermissionsAndroid } from 'react-native';
import { RTCView, MediaStream, MediaStreamTrack, mediaDevices } from 'react-native-webrtc';
import RNFetchBlob from 'rn-fetch-blob';

const App = () => {
  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'App needs access to your camera',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Camera Permission Granted');
      } else {
        console.log('Camera Permission Denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const requestAudioPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        {
          title: 'Microphone Permission',
          message: 'App needs access to your microphone',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Microphone Permission Granted');
      } else {
        console.log('Microphone Permission Denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const startStream = async () => {
    await requestCameraPermission();
    await requestAudioPermission();
    const newStream = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        facingMode: 'user',
      },
    });
    setStream(newStream);
  };

  const stopStream = () => {
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const toggleRecord = () => {
    setIsRecording((prevState) => !prevState);
  };

  const saveVideo = async () => {
    const directory = `${RNFetchBlob.fs.dirs.DCIMDir}/Camera`;
    const fileName = `video_${new Date().getTime()}.mp4`;
    const path = `${directory}/${fileName}`;

    await RNFetchBlob.fs.isDir(directory).then((isDir) => {
      if (!isDir) {
        RNFetchBlob.fs.mkdir(directory);
      }
    });

    await RNFetchBlob.fs.writeStream(path, 'base64').then((stream) => {
      recordedChunks.forEach((chunk) => {
        stream.write(chunk);
      });
      stream.close();
    });
    setRecordedChunks([]);
    console.log(`Video saved to ${path}`);
  };

  const handleVideoDataAvailable = (event) => {
    if (event?.data?.size) {
      setRecordedChunks((prevState) => [...prevState, event.data]);
    }
  };

  return (
    <View style={styles.container}>
      {stream ? (
        <RTCView
          streamURL={stream.toURL()}
          style={styles.rtcView}
          objectFit="cover"
          zOrder={0}
        />
      ) : (
        <View style={styles.noStreamView}>
          <Text style={styles.noStreamText}>No Stream</Text>
        </View>


return (
  <View style={styles.container}>
    {stream ? (
      <View style={styles.buttonContainer}>
        <Button title="Start Camera Stream" onPress={startStream} />
      </View>
    ) : (
      <View style={styles.videoContainer}>
        <RTCView style={styles.rtcView} streamURL={stream.toURL()} />
        <View style={styles.controlBar}>
          <TouchableOpacity onPress={toggleRecording}>
            <Text style={styles.controlText}>{isRecording ? "Stop Recording" : "Start Recording"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={stopStream}>
            <Text style={styles.controlText}>Stop Stream</Text>
          </TouchableOpacity>
        </View>
      </View>
    )}
  </View>
);

     


//
//
//
//
//

// import React, {useState, useEffect} from 'react';
// import {View, TouchableOpacity, Text} from 'react-native';
// import {
//   RTCView,
//   MediaStream,
//   MediaStreamConstraints,
//   mediaDevices,
// } from 'react-native-webrtc';
// import RNFetchBlob from 'rn-fetch-blob';

// const CameraStream = () => {
//   const [stream, setStream] = useState();
//   const [streaming, setStreaming] = useState(false);
//   const [recording, setRecording] = useState(false);
//   const [videoUrl, setVideoUrl] = useState('');

//   useEffect(() => {
//     return () => {
//       if (stream) {
//         stream.release();
//       }
//     };
//   }, [stream]);

//   const startStreaming = async () => {
//     const isFront = true;
//     const facingMode = isFront ? 'user' : 'environment';
//     const constraints = {
//       audio: true,
//       video: {
//         facingMode,
//         width: 640,
//         height: 480,
//       },
//     };
//     const newStream = await mediaDevices.getUserMedia(constraints);
//     setStream(newStream);
//     setStreaming(true);
//   };

//   const stopStreaming = () => {
//     if (stream) {
//       stream.release();
//     }
//     setStream(null);
//     setStreaming(false);
//   };

//   const toggleRecording = () => {
//     if (recording) {
//       setRecording(false);
//       setVideoUrl('');
//     } else {
//       setRecording(true);
//     }
//   };

//   const saveRecording = async data => {
//     const dirs = RNFetchBlob.fs.dirs;
//     const filePath = `${dirs.CacheDir}/recorded_video.mp4`;
//     await RNFetchBlob.fs.writeFile(filePath, data, 'base64');
//     setVideoUrl(`file://${filePath}`);
//   };

//   const onNewFrame = data => {
//     if (recording) {
//       saveRecording(data);
//     }
//   };

//   return (
//     <View style={{flex: 1}}>
//       {!streaming ? (
//         <TouchableOpacity onPress={startStreaming}>
//           <Text style={{fontSize: 20}}>Start Camera Stream</Text>
//         </TouchableOpacity>
//       ) : (
//         <View style={{flex: 1}}>
//           <RTCView
//             streamURL={stream?.toURL()}
//             style={{flex: 1}}
//             objectFit="cover"
//             onFrame={onNewFrame}
//           />
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'center',
//               alignItems: 'center',
//             }}>
//             <TouchableOpacity style={{padding: 10}} onPress={toggleRecording}>
//               <Text style={{fontSize: 20}}>
//                 {recording ? 'Stop Recording' : 'Record Video'}
//               </Text>
//             </TouchableOpacity>
//             {recording && (
//               <Text style={{fontSize: 16}}>{'Recording in progress...'}</Text>
//             )}
//           </View>
//           <TouchableOpacity style={{padding: 10}} onPress={stopStreaming}>
//             <Text style={{fontSize: 20}}>Stop Camera Stream</Text>
//           </TouchableOpacity>
//         </View>
//       )}
//       {videoUrl !== '' && (
//         <Video
//           source={{uri: videoUrl}}
//           style={{width: 400, height: 400}}
//           controls={true}
//         />
//       )}
//     </View>
//   );
// };

// export default CameraStream;
