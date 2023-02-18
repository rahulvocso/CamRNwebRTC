import React, {useState, useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {
  RTCView,
  MediaStream,
  mediaDevices,
  MediaStreamTrack,
  getUserMedia,
} from 'react-native-webrtc';
import {
  checkMultiple,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

import RNFetchBlob from 'rn-fetch-blob';

const CameraStream = () => {
  const [cameraFacing, setCameraFacing] = useState('user');
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [stream, setStream] = useState(null);
  const [streaming, setStreaming] = useState(false);
  const rtcRef = useRef(null);

  useEffect(() => {
    checkMultiple([
      PERMISSIONS.ANDROID.CAMERA,
      PERMISSIONS.ANDROID.RECORD_AUDIO,
    ]).then(statuses => {
      if (
        statuses[PERMISSIONS.ANDROID.CAMERA] === RESULTS.DENIED ||
        statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.DENIED
      ) {
        requestMultiplePermissions();
      } else if (
        statuses[PERMISSIONS.ANDROID.CAMERA] === RESULTS.BLOCKED ||
        statuses[PERMISSIONS.ANDROID.RECORD_AUDIO] === RESULTS.BLOCKED
      ) {
        console.log(
          'Camera and Audio permissions are blocked. Please enable them in app settings.',
        );
      } else {
        startCameraStream();
      }
    });
  }, []);

  const requestMultiplePermissions = () => {
    request(PERMISSIONS.ANDROID.CAMERA).then(result => {
      if (result === RESULTS.GRANTED) {
        request(PERMISSIONS.ANDROID.RECORD_AUDIO).then(result => {
          if (result === RESULTS.GRANTED) {
            startCameraStream();
          } else {
            console.log('Record audio permission denied');
          }
        });
      } else {
        console.log('Camera permission denied');
      }
    });
  };

  const startCameraStream = async () => {
    console.log('Inside startCameraStream');
    const mediaStream = await mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          facingMode: 'user',
          mandatory: {
            minWidth: 500,
            minHeight: 300,
            minFrameRate: 30,
          },
        },
      })
      .then(stream => {
        setStream(stream);
        console.log(stream);
        //localStreamRef.current = stream;
        rtcRef.current.setStreaming(true);
        setStreaming(true);
      });
    // setStream(mediaStream);
    // rtcRef.current.setStreaming(true);
  };

  const stopCameraStream = () => {
    if (stream && stream._tracks.length > 0) {
      stream._tracks.forEach(track => {
        track.stop();
      });
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
    // C:\Users\Yadavendra-Yadav\Desktop\CallngAppRahul\RNTests\CamRNwebRTC\0VideoRecordings
  };

  const onNewFrame = data => {
    if (recording) {
      saveRecording(data);
    }
  };

  const handleCameraSwitch = () => {
    cameraFacing === 'user'
      ? setCameraFacing('environment')
      : setCameraFacing('user');
  };

  const handleCameraOnOff = () => {
    localStreamRef.current.getVideoTracks().forEach(track => {
      track.enabled = !isCameraOn;
    });
    setIsCameraOn(!isCameraOn);
  };

  const handleMicOnOff = () => {
    rtcRef.current.getAudioTracks().forEach(track => {
      track.enabled = !isMicOn;
    });
    setIsMicrophoneOn(!isMicOn);
  };

  return (
    <View style={styles.container}>
      {!streaming ? (
        <TouchableOpacity style={styles.button} onPress={startCameraStream}>
          <Text style={styles.buttonText}>Start Camera Stream</Text>
        </TouchableOpacity>
      ) : (
        <>
          <RTCView
            ref={rtcRef}
            streamURL={stream?.toURL()} //'http://localhost:3005'
            style={styles.rtcView}
            zOrder={20}
            objectFit={'cover'}
            mirror={true}
          />
          // Recording Button
          <TouchableOpacity style={style.button} onPress={toggleRecording}>
            <Text style={style.buttonText}>
              {recording ? 'Stop Recording' : 'Record Video'}
            </Text>
          </TouchableOpacity>
          // Switch Camera
          <TouchableOpacity style={styles.button} onPress={handleCameraSwitch}>
            <Text style={styles.buttonText}>Switch Camera</Text>
          </TouchableOpacity>
          // Camera On/Off
          <TouchableOpacity style={styles.button} onPress={handleCameraOnOff}>
            <Text style={styles.buttonText}>Camera On/Off</Text>
          </TouchableOpacity>
          // Microphone On/Off
          <TouchableOpacity style={styles.button} onPress={handleMicOnOff}>
            <Text style={styles.buttonText}>Mic On/Off</Text>
          </TouchableOpacity>
          // Stop Camera Stream
          <TouchableOpacity style={styles.button} onPress={stopCameraStream}>
            <Text style={styles.buttonText}>Stop Camera Stream</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   button: {
//     backgroundColor: 'blue',
//     padding: 10,
//     borderRadius: 5,
//     margin: 10,
//   },
//   buttonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   rtcView: {
//     flex: 1,
//     // width: '100%',
//     // height: '100%',
//     height: 40,
//     width: 530,
//   },
// });

// export default CameraStream;

//
//
//
//
//

//   //     ) : (
//   //       <View style={styles.noStreamView}>
//   //         <Text style={styles.noStreamText}>No Stream</Text>
//   //       </View>

//   return (
//     <View style={styles.container}>
//       {stream ? (
//         <View style={styles.buttonContainer}>
//           <Button title="Start Camera Stream" onPress={startStream} />
//         </View>
//       ) : (
//         <View style={styles.videoContainer}>
//           <RTCView style={styles.rtcView} streamURL={stream.toURL()} />
//           <View style={styles.controlBar}>
//             <TouchableOpacity onPress={toggleRecording}>
//               <Text style={styles.controlText}>
//                 {isRecording ? 'Stop Recording' : 'Start Recording'}
//               </Text>
//             </TouchableOpacity>
//             <TouchableOpacity onPress={stopStream}>
//               <Text style={styles.controlText}>Stop Stream</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#000',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   rtcView: {
//     flex: 1,
//     width: '100%',
//     backgroundColor: '#000',
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 80,
//     backgroundColor: '#000',
//   },
//   button: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     height: 60,
//     width: 60,
//     borderRadius: 30,
//     backgroundColor: '#fff',
//   },/

//
//
//
//
//
//
//import React, {useState} from 'react';
// import {
//   StyleSheet,
//   Text,
//   View,
//   TouchableOpacity,
//   PermissionsAndroid,
// } from 'react-native';
// import {
//   RTCView,
//   MediaStream,
//   MediaStreamTrack,
//   mediaDevices,
// } from 'react-native-webrtc';
// import RNFetchBlob from 'rn-fetch-blob';

// const CameraStream = () => {
//   const [stream, setStream] = useState(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordedChunks, setRecordedChunks] = useState([]);

//   const requestCameraPermission = async () => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.CAMERA,
//         {
//           title: 'Camera Permission',
//           message: 'App needs access to your camera',
//         },
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log('Camera Permission Granted');
//       } else {
//         console.log('Camera Permission Denied');
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   };

//   const requestAudioPermission = async () => {
//     try {
//       const granted = await PermissionsAndroid.request(
//         PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
//         {
//           title: 'Microphone Permission',
//           message: 'App needs access to your microphone',
//         },
//       );
//       if (granted === PermissionsAndroid.RESULTS.GRANTED) {
//         console.log('Microphone Permission Granted');
//       } else {
//         console.log('Microphone Permission Denied');
//       }
//     } catch (err) {
//       console.warn(err);
//     }
//   };

//   const startStream = async () => {
//     await requestCameraPermission();
//     await requestAudioPermission();
//     const newStream = await mediaDevices.getUserMedia({
//       audio: true,
//       video: {
//         facingMode: 'user',
//       },
//     });
//     setStream(newStream);
//   };

//   const stopStream = () => {
//     stream?.getTracks().forEach(track => track.stop());
//     setStream(null);
//   };

//   const toggleRecord = () => {
//     setIsRecording(prevState => !prevState);
//   };

//   const saveVideo = async () => {
//     const directory = `${RNFetchBlob.fs.dirs.DCIMDir}/Camera`;
//     const fileName = `video_${new Date().getTime()}.mp4`;
//     const path = `${directory}/${fileName}`;

//     await RNFetchBlob.fs.isDir(directory).then(isDir => {
//       if (!isDir) {
//         RNFetchBlob.fs.mkdir(directory);
//       }
//     });
//     toURL;
//     await RNFetchBlob.fs.writeStream(path, 'base64').then(stream => {
//       recordedChunks.forEach(chunk => {
//         stream.write(chunk);
//       });
//       stream.close();
//     });
//     setRecordedChunks([]);
//     console.log(`Video saved to ${path}`);
//   };

//   const handleVideoDataAvailable = event => {
//     if (event?.data?.size) {
//       setRecordedChunks(prevState => [...prevState, event.data]);
//     }
//   };

//   // return (
//   //   <View style={styles.container}>
//   //     {stream ? (
//   //       <RTCView
//   //         streamURL={stream.toURL()}
//   //         style={styles.rtcView}
//   //         objectFit="cover"
//   //         zOrder={0}
//   //
//   buttonText: {
//     color: '#000',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
// });

// export default CameraStream;

//
//
//
//
//

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
    // C:\Users\Yadavendra-Yadav\Desktop\CallngAppRahul\RNTests\CamRNwebRTC\0VideoRecordings
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
            zOrder={20}
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
