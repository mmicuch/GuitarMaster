import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  frets: number[];
  fingers: number[];
  isBarred?: boolean;
  barredFret?: number;
  size?: 'small' | 'medium' | 'large';
}

export const ChordDiagram: React.FC<Props> = ({
  frets,
  fingers,
  isBarred = false,
  barredFret,
  size = 'medium'
}) => {
  const getFretboardDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 120, height: 150, dotSize: 16 };
      case 'large':
        return { width: 200, height: 250, dotSize: 28 };
      default:
        return { width: 160, height: 200, dotSize: 22 };
    }
  };

  const { width, height, dotSize } = getFretboardDimensions();
  const stringSpacing = width / 5;
  const fretSpacing = height / 6;

  const renderStrings = () => (
    <>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View
          key={`string-${i}`}
          style={[
            styles.string,
            {
              left: i * stringSpacing,
              height: height - fretSpacing / 2
            }
          ]}
        />
      ))}
    </>
  );

  const renderFrets = () => (
    <>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <View
          key={`fret-${i}`}
          style={[
            styles.fret,
            {
              top: i * fretSpacing,
              width: width - stringSpacing / 2
            }
          ]}
        />
      ))}
    </>
  );

  const renderDots = () => (
    <>
      {frets.map((fret, stringIndex) => {
        if (fret === -1) return null;
        return (
          <View
            key={`dot-${stringIndex}`}
            style={[
              styles.dot,
              {
                left: stringIndex * stringSpacing - dotSize / 2,
                top: (fret + 0.5) * fretSpacing - dotSize / 2,
                width: dotSize,
                height: dotSize,
                backgroundColor: isBarred && fret === barredFret ? '#FF9500' : '#007AFF'
              }
            ]}
          >
            <Text style={styles.fingerText}>
              {fingers[stringIndex] || ''}
            </Text>
          </View>
        );
      })}
    </>
  );

  const renderBarre = () => {
    if (!isBarred || barredFret === undefined) return null;

    const startString = frets.findIndex(f => f === barredFret);
    const endString = frets.lastIndexOf(barredFret);
    if (startString === -1 || endString === -1 || startString === endString) return null;

    return (
      <View
        style={[
          styles.barre,
          {
            left: startString * stringSpacing,
            top: (barredFret + 0.5) * fretSpacing - 2,
            width: (endString - startString) * stringSpacing,
          }
        ]}
      />
    );
  };

  return (
    <View style={[styles.container, { width, height }]}>
      {renderStrings()}
      {renderFrets()}
      {renderBarre()}
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  string: {
    position: 'absolute',
    width: 1,
    backgroundColor: '#404040',
  },
  fret: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#404040',
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  fingerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  barre: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#FF9500',
    borderRadius: 2,
    zIndex: 0,
  },
});