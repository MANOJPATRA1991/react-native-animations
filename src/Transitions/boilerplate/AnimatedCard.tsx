/* eslint-disable max-len */
import { StyleSheet, Dimensions } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { mix } from "react-native-redash";

import type { Cards } from "../../components";
import { Card, StyleGuide } from "../../components";

const { width } = Dimensions.get("window");
const origin = -(width / 2 - StyleGuide.spacing * 2);
/**
 * https://stackoverflow.com/questions/53676723/react-native-what-is-the-difference-between-stylesheet-absolutefill-and-styl
 */
const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: StyleGuide.spacing * 4,
  },
});

interface AnimatedCardProps {
  transition: Animated.SharedValue<number>;
  index: number;
  card: Cards;
}

export const AnimatedCard = ({
  transition,
  index,
  card,
}: AnimatedCardProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    // x * (1 - value) + y * value
    const alpha = mix(transition.value, 0, ((index - 1) * Math.PI) / 6);
    return {
      transform: [
        { translateX: origin },
        { rotate: `${alpha}rad` },
        { translateX: -origin },
      ],
    };
  });
  return (
    <Animated.View key={card} style={[styles.overlay, animatedStyle]}>
      <Card {...{ card }} />
    </Animated.View>
  );
};
