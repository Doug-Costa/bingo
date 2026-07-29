import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { alphaColor } from '../theme/themes';

export type IconName =
  | 'trophy'
  | 'calendar'
  | 'clock'
  | 'dice'
  | 'crown'
  | 'ticket'
  | 'jackpot'
  | 'volume-on'
  | 'volume-off'
  | 'globe'
  | 'logout'
  | 'star'
  | 'fire'
  | 'check'
  | 'grid'
  | 'sparkle'
  | 'user'
  | 'cards';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = '#ffffff' }) => {
  switch (name) {
    case 'trophy':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <Path d="M4 22h16" />
          <Path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34" />
          <Path d="M18 4H6v7a6 6 0 0 0 12 0V4z" fill={alphaColor(color, '22')} />
        </Svg>
      );

    case 'calendar':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <Path d="M16 2v4" />
          <Path d="M8 2v4" />
          <Path d="M3 10h18" />
        </Svg>
      );

    case 'clock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 6v6l4 2" />
        </Svg>
      );

    case 'dice':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Rect x="3" y="3" width="18" height="18" rx="4" />
          <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
          <Circle cx="15.5" cy="8.5" r="1.5" fill={color} />
          <Circle cx="12" cy="12" r="1.5" fill={color} />
          <Circle cx="8.5" cy="15.5" r="1.5" fill={color} />
          <Circle cx="15.5" cy="15.5" r="1.5" fill={color} />
        </Svg>
      );

    case 'crown':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M2 4l3 12h14l3-12-6 7-4-8-4 8-6-7z" fill={alphaColor(color, '33')} />
          <Path d="M5 20h14" />
        </Svg>
      );

    case 'ticket':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3z" />
          <Path d="M13 5v14" strokeDasharray="2 2" />
        </Svg>
      );

    case 'jackpot':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M6 3h12l4 6-10 12L2 9l4-6z" fill={alphaColor(color, '33')} />
          <Path d="M11 3l1 18" />
          <Path d="M2 9h20" />
        </Svg>
      );

    case 'volume-on':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M11 5L6 9H2v6h4l5 4V5z" />
          <Path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <Path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </Svg>
      );

    case 'volume-off':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M11 5L6 9H2v6h4l5 4V5z" />
          <Path d="M23 9l-6 6" />
          <Path d="M17 9l6 6" />
        </Svg>
      );

    case 'globe':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="12" cy="12" r="10" />
          <Path d="M2 12h20" />
          <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </Svg>
      );

    case 'logout':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <Path d="M16 17l5-5-5-5" />
          <Path d="M21 12H9" />
        </Svg>
      );

    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </Svg>
      );

    case 'fire':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M12 2c1 3 2.5 3.5 3.5 6 1.5 3.5.5 7.5-2.5 9-1.5.8-3.5.8-5 0-3-1.5-4-5.5-2.5-9C6.5 5.5 8 5 9 2c1 2 2 2 3 0z" fill={alphaColor(color, '44')} />
        </Svg>
      );

    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M20 6L9 17l-5-5" />
        </Svg>
      );

    case 'grid':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Rect x="3" y="3" width="7" height="7" />
          <Rect x="14" y="3" width="7" height="7" />
          <Rect x="14" y="14" width="7" height="7" />
          <Rect x="3" y="14" width="7" height="7" />
        </Svg>
      );

    case 'sparkle':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1">
          <Path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" />
        </Svg>
      );

    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <Circle cx="12" cy="7" r="4" />
        </Svg>
      );

    case 'cards':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Rect x="2" y="6" width="14" height="15" rx="2" fill={alphaColor(color, '22')} />
          <Path d="M6 3h12a2 2 0 0 1 2 2v12" />
        </Svg>
      );

    default:
      return null;
  }
};

export default Icon;
