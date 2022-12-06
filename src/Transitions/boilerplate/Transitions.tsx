import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import type {
  WithSpringConfig,
  WithTimingConfig,
} from "react-native-reanimated";
import {
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Button, StyleGuide, cards } from "../../components";

import { AnimatedCard } from "./AnimatedCard";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StyleGuide.palette.background,
    justifyContent: "flex-end",
  },
});

const useSpring = (state: number | boolean, config?: WithSpringConfig) => {
  const value = useSharedValue(0);

  useEffect(() => {
    if (typeof state === "number") {
      value.value = state;
    } else {
      value.value = state ? 1 : 0;
    }
  }, [state, value]);

  return useDerivedValue(() => {
    return withSpring(value.value, config);
  });
};

const useTiming = (state: number | boolean, config?: WithTimingConfig) => {
  const value = useSharedValue(0);

  useEffect(() => {
    if (typeof state === "number") {
      value.value = state;
    } else {
      value.value = state ? 1 : 0;
    }
  }, [state, value]);

  return useDerivedValue(() => {
    return withTiming(value.value, config);
  });
};

export const Transitions = () => {
  const toggled = useSharedValue(0); // 0 => false
  // const transition = useTiming(toggled, {
  //   duration: 600,
  // });

  const transition = useDerivedValue(() => {
    return withSpring(toggled.value);
  }, [toggled]);

  return (
    <View style={styles.container}>
      {cards.slice(0, 3).map((card, index) => (
        <AnimatedCard key={card} {...{ index, card, transition }} />
      ))}
      <Button
        label={toggled.value ? "Reset" : "Start"}
        primary
        onPress={() => (toggled.value = !toggled.value ? 1 : 0)}
      />
    </View>
  );
};
