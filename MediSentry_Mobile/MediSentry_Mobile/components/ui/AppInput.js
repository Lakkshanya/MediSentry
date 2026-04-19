import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes, Spacing } from '../../constants/theme';

const AppInput = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  keyboardType = 'default',
  icon,
  error,
  isPassword = false,
  multiline = false,
  numberOfLines,
  ...props 
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isSecure = isPassword ? !isPasswordVisible : secureTextEntry;
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputContainer,
        multiline && styles.inputContainerMultiline,
        error && styles.errorInput
      ]}>
        <View style={multiline ? styles.iconWrapperTop : styles.iconWrapperCenter}>
          {icon}
        </View>
        <TextInput
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize="none"
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
          includeFontPadding={false}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity 
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.eyeBtn}
          >
            <Ionicons 
              name={isPasswordVisible ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color={Colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: Sizes.radius,
    height: Sizes.inputHeight,
    paddingHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  inputContainerMultiline: {
    height: undefined,
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: 0,
  },
  iconWrapperCenter: {
    justifyContent: 'center',
  },
  iconWrapperTop: {
    paddingTop: 14,
  },
  eyeBtn: {
    padding: Spacing.xs,
  },
  input: {
    flex: 1,
    height: '100%',
    color: Colors.text,
    fontSize: 16,
    marginLeft: Spacing.sm,
    fontWeight: '500',
    paddingVertical: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  inputMultiline: {
    height: undefined,
    minHeight: 80,
    paddingTop: 14,
  },
  errorInput: {
    borderColor: Colors.danger,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '600',
  },
});

export default AppInput;
