import Svg, { Circle, Path } from 'react-native-svg';

type IconProps = { color: string; size?: number };

const stroke = {
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none',
};

export const HomeIcon = ({ color, size = 19 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" stroke={color} {...stroke} />
  </Svg>
);

export const DiaryIcon = ({ color, size = 19 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M5 4h13a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5z" stroke={color} {...stroke} />
    <Path d="M9 9h6M9 13h6" stroke={color} {...stroke} />
  </Svg>
);

export const YouIcon = ({ color, size = 19 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={12} cy={8} r={3.5} stroke={color} {...stroke} />
    <Path d="M5 20c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" stroke={color} {...stroke} />
  </Svg>
);

export const ScanIcon = ({ color, size = 24 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M4 9V6a2 2 0 0 1 2-2h3M15 4h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M9 20H6a2 2 0 0 1-2-2v-3"
      stroke={color}
      {...stroke}
      strokeWidth={2.2}
    />
  </Svg>
);

export const FlameIcon = ({ color, size = 13 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M12 2s5 4.5 5 9a5 5 0 0 1-10 0c0-1.6.7-3 1.5-4 .3 1.4 1.2 2 2 2 0-3 1.5-5.5 1.5-7z" fill={color} />
  </Svg>
);

export const BackIcon = ({ color, size = 18 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M15 5l-7 7 7 7" stroke={color} {...stroke} strokeWidth={2.2} />
  </Svg>
);

export const SearchIcon = ({ color, size = 20 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Circle cx={11} cy={11} r={6.5} stroke={color} {...stroke} />
    <Path d="M16 16l4 4" stroke={color} {...stroke} strokeWidth={2.2} />
  </Svg>
);
