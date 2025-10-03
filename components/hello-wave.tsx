import { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export function HelloWave() {
  const [rotationInput, setRotationInput] = useState('0');
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleRotate = () => {
    const degrees = parseFloat(rotationInput) || 0;
    rotation.value = withTiming(degrees, { duration: 500 });
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <Animated.Image
        source={require('../assets/images/react-logo.png')}
        style={[{ width: 100, height: 100, marginBottom: 16 }, animatedStyle]}
        resizeMode="contain"
      />
      <TextInput
        value={rotationInput}
        onChangeText={setRotationInput}
        keyboardType="numeric"
        style={{ backgroundColor: 'white', color: 'black', width: 80, height: 40, textAlign: 'center', borderRadius: 8, marginBottom: 8, fontSize: 18 }}
        placeholder="Degrees"
        placeholderTextColor="#888"
      />
      <Button title="Rotate" onPress={handleRotate} />
      <Animated.Text
        style={{
          fontSize: 28,
          lineHeight: 32,
          marginTop: 16,
        }}>
        👋
      </Animated.Text>
    </View>
  );
}
