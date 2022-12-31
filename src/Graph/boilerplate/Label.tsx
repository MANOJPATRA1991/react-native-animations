/* eslint-disable react-native/no-unused-styles */

import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { clamp, ReText, round } from "react-native-redash";

import { StyleGuide } from "../../components";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  date: {
    ...StyleGuide.typography.caption,
    textAlign: "center",
  },
  price: {
    ...StyleGuide.typography.caption,
    textAlign: "center",
  },
  container: {
    borderWidth: 4,
    backgroundColor: "#fff",
    padding: 12,
    borderColor: "#367be2",
    borderRadius: 10,
    position: "absolute",
    zIndex: 10001,
    width: 150,
  },
});

export interface DataPoint {
  coord: {
    x: number;
    y: number;
  };
  data: {
    x: number;
    y: number;
  };
}

interface LabelProps {
  point: Animated.SharedValue<DataPoint>;
}

export const Label = ({ point }: LabelProps) => {
  const date = useDerivedValue(() => {
    return new Date(point.value.data.x).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  const price = useDerivedValue(() => {
    return `$ ${round(point.value.data.y, 2).toLocaleString("en-US", {
      currency: "USD",
    })}`;
  });

  const style = useAnimatedStyle(() => {
    const {
      coord: { x, y },
    } = point.value;

    return {
      top: y,
      left: clamp(x - 150, 10, width - 10),
    };
  });

  return (
    <Animated.View style={[styles.container, style]}>
      <ReText style={styles.date} text={date} />
      <ReText style={styles.price} text={price} />
    </Animated.View>
  );
};
