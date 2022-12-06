import { StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { StyleGuide } from "../../components";

const size = 32;
const styles = StyleSheet.create({
  bubble: {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: StyleGuide.palette.primary,
  },
});

interface BubbleProps {
  start: number;
  end: number;
  progress: Animated.SharedValue<number>;
}

export const Bubble = ({ start, end, progress }: BubbleProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [start, end],
      [0.5, 1],
      Extrapolate.CLAMP
    );

    const scale = interpolate(
      progress.value,
      [start, end],
      [1, 1.5],
      Extrapolate.CLAMP
    );

    return { opacity, transform: [{ scale }] };
  });

  return <Animated.View style={[styles.bubble, animatedStyle]} />;
};
