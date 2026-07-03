export interface HyperspeedOptions {
  speed?: number;
  colors?: string[];
  count?: number;
  distortion?: number;
  roadWidth?: number;
  roadHeight?: number;
  fogColor?: string;
}

export const hyperspeedPresets = {
  one: {
    speed: 3,
    colors: ['#00ffff', '#ff007f', '#a855f7', '#3b82f6'],
    count: 300,
    distortion: 0.6,
    roadWidth: 12,
    roadHeight: 3,
    fogColor: '#090d16',
  }
};
export default hyperspeedPresets;
