import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Sizes, Spacing, Shadow } from '../../constants/theme';

const AppButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  style,
  textStyle 
}) => {
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  
  const getColors = () => {
    if (disabled) return ['#CBD5E1', '#CBD5E1'];
    if (isDanger) return [Colors.danger, '#C53030'];
    return [Colors.primary, Colors.accent]; // Branding Purple to Darker purple
  };

  const Content = () => (
    <>
      {loading ? (
        <ActivityIndicator color={isOutline ? Colors.primary : Colors.white} />
      ) : (
        <Text style={[
          styles.text, 
          { color: isOutline ? Colors.primary : Colors.white },
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </>
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      {isOutline ? (
        <View style={[
          styles.button, 
          styles.outlineButton,
          { borderColor: Colors.primary }
        ]}>
          <Content />
        </View>
      ) : (
        <LinearGradient
          colors={getColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.button, !disabled && Shadow.medium]}
        >
          <Content />
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: Spacing.xs,
  },
  button: {
    height: Sizes.buttonHeight,
    borderRadius: Sizes.radiusFull,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
  },
  outlineButton: {
    backgroundColor: 'rgba(86, 7, 119, 0.05)',
    borderWidth: 1.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default AppButton;
