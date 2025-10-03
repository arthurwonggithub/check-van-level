import { useEffect, useState } from 'react';
import { Button, Dimensions, FlatList, Image, PermissionsAndroid, Platform, Text, TextInput, View } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { PERMISSIONS, requestMultiple } from 'react-native-permissions';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function HelloWave() {
  const [rotateAmount, setRotateAmount] = useState('0');
  const [displayRotation, setDisplayRotation] = useState(0);
  const rotation = useSharedValue(0);
  const [devices, setDevices] = useState<Device[]>([]);
  const [btLog, setBtLog] = useState<string>('');
  const bleManager = new BleManager();

  // Request Bluetooth permissions on mount
  useEffect(() => {
    (async () => {
      try {
        if (Platform.OS === 'android') {
          if (Platform.Version >= 31) {
            const perms = [
              PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
              PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
              PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
            ];
            const statuses = await requestMultiple(perms);
            setBtLog(prev => prev + (prev ? '\n' : '') + `Permission statuses: ${JSON.stringify(statuses)}`);
          } else {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION, {
              title: 'Location required',
              message: 'Location permission is required to scan for Bluetooth devices on older Android versions.',
              buttonPositive: 'OK',
            });
            setBtLog(prev => prev + (prev ? '\n' : '') + `ACCESS_FINE_LOCATION: ${granted}`);
          }
        } else if (Platform.OS === 'ios') {
          const statuses = await requestMultiple([PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL]);
          setBtLog(prev => prev + (prev ? '\n' : '') + `iOS permission statuses: ${JSON.stringify(statuses)}`);
        }
      } catch (err: any) {
        setBtLog(prev => prev + (prev ? '\n' : '') + `Permission request error: ${err?.message || err}`);
      }
    })();
  }, []);

  useEffect(() => { 
    const discovered: Record<string, boolean> = {};
    const log = (msg: string) => setBtLog(prev => prev + (prev ? '\n' : '') + msg);
    const subscription = bleManager.onStateChange((state) => {
      log(`Bluetooth State: ${state}`);
      if (state === 'PoweredOn') {
        bleManager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            log(`Scan Error: ${error.message}`);
            return;
          }
          if (device && !discovered[device.id]) {
            discovered[device.id] = true; 
            setDevices((prev: Device[]) => [...prev, device]);
          }
        });
        // Stop scan after 5 seconds
        setTimeout(() => bleManager.stopDeviceScan(), 5000);
      }
    }, true);
    return () => {
      bleManager.stopDeviceScan();
      subscription.remove();
    };
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const windowWidth = Dimensions.get('window').width;
  const imageSource = require('../assets/images/van-side-view.jpg');

  // Update displayRotation only after animation finishes
  const handleRotate = () => {
    const value = parseFloat(rotateAmount) || 0;
    rotation.value = withTiming(rotation.value + value, { duration: 1000 }, (finished) => {
      if (finished) {
        runOnJS(setDisplayRotation)(rotation.value);
      }
    });
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Animated.View style={[{ width: windowWidth, aspectRatio: 2 }, animatedStyle]}>
        <Image
          source={imageSource}
          style={{ width: '100%', height: '100%', resizeMode: 'cover', borderRadius: 8 }}
        />
      </Animated.View>
      {/* Display rotation value as white text after animation */}
      <Animated.Text
        style={{ color: 'white', fontSize: 20, marginTop: 12, fontWeight: 'bold', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 }}>
        {displayRotation.toFixed(2)}°
      </Animated.Text>
      {/* Bluetooth devices list */}
      <View style={{ width: '100%', marginTop: 16, marginBottom: 16 }}>
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 8 }}>Available Bluetooth Devices:</Text>
        <FlatList
          data={devices as Device[]}
          keyExtractor={item => item.id}
          style={{ backgroundColor: '#222', borderRadius: 8, maxHeight: 180 }}
          renderItem={({ item }) => (
            <View
              style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#444' }}
              onTouchEnd={() => {
                // Connect to device when clicked
                item.connect()
                  .then(() => setBtLog(prev => prev + (prev ? '\n' : '') + `Connected to ${item.name || 'Unnamed'} (${item.id})`))
                  .catch(err => setBtLog(prev => prev + (prev ? '\n' : '') + `Connection error: ${err.message}`));
              }}
            >
              <Text style={{ color: 'white' }}>{item.name || 'Unnamed'} ({item.id})</Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: 'gray', padding: 8 }}>No devices found</Text>}
        />
      </View>
      {/* Bluetooth log field */}
      <View style={{ width: '100%', marginBottom: 16 }}>
        <Text style={{ color: 'white', fontSize: 16, marginBottom: 4 }}>Bluetooth Log:</Text>
        <TextInput
          value={btLog}
          editable={false}
          multiline
          style={{ backgroundColor: '#222', color: 'white', minHeight: 60, borderRadius: 8, padding: 8, fontSize: 14, borderWidth: 1, borderColor: '#444' }}
        />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24 }}>
        <TextInput
          value={rotateAmount}
          onChangeText={setRotateAmount}
          keyboardType="numeric"
          placeholder="Degrees"
          style={{ backgroundColor: 'white', color: 'black', width: 80, height: 40, borderRadius: 6, paddingHorizontal: 12, marginRight: 12, fontSize: 18, borderWidth: 1, borderColor: '#ccc' }}
        />
        <Button title="Rotate" onPress={handleRotate} />
      </View>
    </View>
  );
}
