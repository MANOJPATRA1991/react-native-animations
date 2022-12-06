import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  withTiming,
  withRepeat,
  useSharedValue,
  Easing,
} from "react-native-reanimated";
import { withPause } from "react-native-redash";

import { Button, StyleGuide } from "../../components";

import { ChatBubble } from "./ChatBubble";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: StyleGuide.palette.background,
  },
});

export const Animations = () => {
  const [play, setPlay] = useState(false);

  const paused = useSharedValue<boolean>(!play);
  const progress = useSharedValue<number>(0);

  useEffect(() => {
    progress.value = withPause(
      withRepeat(
        withTiming(1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      ),
      paused
    );
  }, [paused, progress]);

  return (
    <View style={styles.container}>
      <ChatBubble progress={progress} />
      <Button
        label={play ? "Pause" : "Play"}
        primary
        onPress={() => {
          setPlay((prev) => !prev);
          paused.value = !paused.value;
        }}
      />
    </View>
  );
};
