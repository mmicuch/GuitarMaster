import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

interface Props {
  progress: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  label?: string;
  color?: string;
}

export const ProgressIndicator: React.FC<Props> = ({
  progress,
  size = 'medium',
  showLabel = true,
  label,
  color,
}) => {
  const { theme } = useTheme();

  const getSize = () => {
    switch (size) {
      case 'small': return 60;
      case 'large': return 120;
      default: return 80;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return 12;
      case 'large': return 24;
      default: return 16;
    }
  };

  const dimensions = getSize();
  const strokeWidth = dimensions * 0.1;
  const radius = (dimensions - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.container, { width: dimensions, height: dimensions }]}>
      <Svg width={dimensions} height={dimensions}>
        {/* Background circle */}
        <Circle
          stroke={theme.colors.surface}
          fill="none"
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <Circle
          stroke={color || theme.colors.primary}
          fill="none"
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={progressOffset}
          strokeLinecap="round"
        />
      </Svg>
      
      <View style={[styles.labelContainer, { width: dimensions, height: dimensions }]}>
        <Text style={[styles.progressText, { color: theme.colors.text, fontSize: getFontSize() }]}>
          {Math.round(progress)}%
        </Text>
        {showLabel && label && (
          <Text style={[styles.label, { color: theme.colors.textSecondary, fontSize: getFontSize() * 0.75 }]}>
            {label}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontWeight: 'bold',
  },
  label: {
    marginTop: 4,
  },
});