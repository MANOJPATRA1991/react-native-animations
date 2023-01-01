import type { ReactElement } from "react";
import React from "react";
import { ScrollView } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { SortableItem } from "./SortableItem";

interface SortableListProps {
  children: ReactElement[];
  item: { width: number; height: number };
}

export const SortableList = ({
  children,
  item: { width, height },
}: SortableListProps) => {
  const activeCard = useSharedValue(-1);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const offsets = children.map((_, i) => ({ y: useSharedValue(height * i) }));

  return (
    <ScrollView contentContainerStyle={{ height: height * children.length }}>
      {children.map((child, index) => (
        <SortableItem
          key={index}
          {...{ offsets, index, item: { width, height }, activeCard }}
        >
          {child}
        </SortableItem>
      ))}
    </ScrollView>
  );
};
