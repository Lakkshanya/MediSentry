import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Sizes, Shadow, Spacing } from '../../constants/theme';

const AppCard = ({ children, style, noPadding = false }) => {
  return (
    <View style={[
      styles.card, 
      !noPadding && styles.padding,
      Shadow.light,
      style
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Sizes.radius,
    marginVertical: Spacing.sm,
    width: '100%',
  },
  padding: {
    padding: Spacing.md,
  },
});

export default AppCard;
