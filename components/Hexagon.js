import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Polygon, Defs, ClipPath, Image as SvgImage } from 'react-native-svg';

const Hexagon = ({ size, color, image, onPress, isEmpty }) => {
  const height = size;
  const width = size * 0.866;
  const clipId = `hex-${size}`;

  const points = `${width/2},0 ${width},${height/4} ${width},${height*3/4} ${width/2},${height} 0,${height*3/4} 0,${height/4}`;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isEmpty}
      style={{ width, height }}
      activeOpacity={isEmpty ? 1 : 0.7}
    >
      <Svg height={height} width={width}>
        <Defs>
          <ClipPath id={clipId}>
            <Polygon points={points} />
          </ClipPath>
        </Defs>
        <Polygon
          points={points}
          fill={color}
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="1"
        />

        {image && (
          <SvgImage
            href={image}
            x={0} y={0}
            width={width} height={height}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
        )}

        {image && (
          <Polygon
            points={points}
            fill="rgba(200, 100, 0, 0.38)"
          />
        )}
      </Svg>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({});

export default Hexagon;

