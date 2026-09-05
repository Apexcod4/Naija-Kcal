import { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { dashOffset } from '../logic/rings';
import { colors } from '../theme/tokens';

type Props = {
  value: number;
  target: number;
  /** SVG viewBox size the geometry is authored against. */
  size: number;
  r: number;
  strokeWidth: number;
  circumference: number;
  colour: string;
  /** Rendered centred inside the ring. */
  children?: ReactNode;
  /** Rendered diameter; defaults to the viewBox size. */
  diameter?: number;
};

export default function ProgressRing({
  value,
  target,
  size,
  r,
  strokeWidth,
  circumference,
  colour,
  children,
  diameter,
}: Props) {
  const d = diameter ?? size;
  const offset = dashOffset(value, target, circumference);
  const c = size / 2;

  return (
    <View style={{ width: d, height: d, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={d}
        height={d}
        viewBox={`0 0 ${size} ${size}`}
        style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={colors.ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          testID="ring-progress"
          cx={c}
          cy={c}
          r={r}
          stroke={colour}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
        />
      </Svg>
      {children}
    </View>
  );
}
