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
    rotation.value = withTiming(rotation.value + degrees, { duration: 1000 });
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <Animated.Image
        source={require('../assets/images/van-side-view.jpg')}
        style={[{ width: 100, height: 100, marginBottom: 20 }, animatedStyle]}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <TextInput
          value={rotationInput}
          onChangeText={setRotationInput}
          keyboardType="numeric"
          style={{ backgroundColor: 'white', color: 'black', width: 80, height: 40, borderRadius: 6, textAlign: 'center', marginRight: 10, borderWidth: 1, borderColor: '#ccc' }}
          placeholder="Degrees"
        />
        <Button title="Rotate" onPress={handleRotate} />
      </View>
    </View>
  );
}
