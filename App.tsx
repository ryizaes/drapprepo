import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
} from 'react-native';

import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';

export default function App(): React.JSX.Element {
  const device = useCameraDevice('back');
  const cameraRef = useRef<Camera>(null);

  const { hasPermission, requestPermission } = useCameraPermission();
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
      }
      await requestPermission();
    };

    init();
  }, [requestPermission]);

  const onCameraInitialized = () => {
    console.log('📷 Camera ready');
    setIsReady(true);
  };

  const takePhoto = async () => {
    try {
      console.log('📸 Pressed');

      if (!isReady) {
        console.log('Camera not ready yet');
        return;
      }

      if (!cameraRef.current) {
        console.log('No camera ref');
        return;
      }

      // 🔥 THIS IS THE REAL GUARD
      if (typeof cameraRef.current.takePhoto !== 'function') {
        console.log(
          '❌ takePhoto not available (Vision Camera not initialized correctly)',
        );
        return;
      }

      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });

      console.log('📷 RESULT:', photo);

      if (photo?.path) {
        setPhotoPath(photo.path);
      }
    } catch (e) {
      console.log('❌ ERROR:', e);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        onInitialized={onCameraInitialized}
      />

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <View style={styles.shutterBtn}>
            <View style={styles.shutterInner} />
          </View>
        </TouchableOpacity>

        {photoPath && (
          <Text style={styles.pathText} numberOfLines={1}>
            {photoPath}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  controls: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },

  button: {
    marginBottom: 20,
  },

  shutterBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },

  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },

  pathText: {
    color: 'white',
    fontSize: 12,
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
});
