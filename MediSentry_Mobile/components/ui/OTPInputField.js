import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Colors, Sizes, Spacing } from '../../constants/theme';

const OTPInputField = ({ length = 6, value, onOtpChange }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    onOtpChange(newOtp.join(''));

    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputs.current[index] = ref)}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={1}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
  },
  input: {
    width: 45,
    height: 55,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Sizes.radius,
    backgroundColor: Colors.white,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
});

export default OTPInputField;
