import * as React from "react";
import { StyleSheet } from "react-native";
import type { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
} from "react-native-reanimated";
import { canvas2Polar, clamp, polar2Canvas } from "react-native-redash";

import { StyleGuide } from "../../components";

interface CursorProps {
  r: number;
  strokeWidth: number;
  theta: Animated.SharedValue<number>;
  backgroundColor: Animated.SharedValue<string | number>;
}

export const Cursor = ({
  r,
  strokeWidth,
  theta,
  backgroundColor,
}: CursorProps) => {
  const center = { x: r, y: r };

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    {
      offset: { x: number; y: number };
    }
  >({
    onStart: (_, ctx) => {
      ctx.offset = polar2Canvas(
        {
          theta: theta.value,
          radius: r,
        },
        center
      );
    },
    onActive: (event, ctx) => {
      const { translationX, translationY } = event;
      const x = ctx.offset.x + translationX;
      const y1 = ctx.offset.y + translationY;

      // if x < r
      let y = y1;

      if (x > r) {
        if (theta.value < Math.PI) {
          y = clamp(y1, 0, r - 0.001);
        } else {
          y = clamp(y1, r, 2 * r);
        }
      }

      const value = canvas2Polar({ x, y }, center).theta;
      theta.value = value > 0 ? value : 2 * Math.PI + value;
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const { x: translateX, y: translateY } = polar2Canvas(
      {
        theta: theta.value,
        radius: r,
      },
      center
    );
    return {
      backgroundColor: backgroundColor.value,
      transform: [{ translateX }, { translateY }],
    };
  });

  return (
    <PanGestureHandler {...{ onGestureEvent }}>
      <Animated.View
        style={[
          {
            ...StyleSheet.absoluteFillObject,
            width: strokeWidth,
            height: strokeWidth,
            borderRadius: strokeWidth / 2,
            borderColor: "white",
            borderWidth: 5,
            backgroundColor: StyleGuide.palette.primary,
          },
          animatedStyle,
        ]}
      />
    </PanGestureHandler>
  );
};
