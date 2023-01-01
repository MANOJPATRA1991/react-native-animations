import type { ReactElement } from "react";
import type { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface SortableItemProps {
  index: number;
  offsets: { y: Animated.SharedValue<number> }[];
  children: ReactElement;
  item: { width: number; height: number };
  activeCard: Animated.SharedValue<number>;
}

export const SortableItem = ({
  index,
  offsets,
  children,
  item: { width, height },
  activeCard,
}: SortableItemProps) => {
  const isGestureActive = useSharedValue(false);
  const currentOffset = offsets[index];

  const x = useSharedValue(0);
  const y = useSharedValue(0);

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { offsetY: number }
  >({
    onStart: (_, ctx) => {
      isGestureActive.value = true;
      activeCard.value = index;
      ctx.offsetY = currentOffset.y.value;
    },
    onActive: ({ translationX, translationY }, ctx) => {
      x.value = translationX;
      y.value = translationY + ctx.offsetY;
      const offsetY = Math.round(y.value / height) * height;
      offsets.forEach((offset, i) => {
        if (offset.y.value === offsetY && index !== i) {
          offset.y.value = currentOffset.y.value;
          currentOffset.y.value = offsetY;
        }
      });
    },
    onEnd: () => {
      isGestureActive.value = false;
      x.value = withSpring(0);
      y.value = withSpring(currentOffset.y.value);
    },
  });

  const translateY = useDerivedValue(() => {
    if (isGestureActive.value) {
      return y.value;
    } else {
      return withSpring(currentOffset.y.value);
    }
  });

  const style = useAnimatedStyle(() => ({
    position: "absolute",
    top: 0,
    left: 0,
    width,
    height,
    zIndex: activeCard.value === index ? 100 : 1,
    transform: [
      { translateY: translateY.value },
      { translateX: x.value },
      { scale: withSpring(isGestureActive.value ? 1.05 : 1) },
    ],
  }));

  return (
    <PanGestureHandler {...{ onGestureEvent }}>
      <Animated.View style={style}>{children}</Animated.View>
    </PanGestureHandler>
  );
};
