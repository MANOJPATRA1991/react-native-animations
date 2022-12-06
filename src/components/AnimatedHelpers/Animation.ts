import type Animated from "react-native-reanimated";
import { clamp } from "react-native-redash";

declare let _WORKLET: boolean;

interface AnimationState {
  current: number;
}

interface PhysicsAnimationState extends AnimationState {
  velocity: number;
}

type Animation<
  State extends AnimationState = AnimationState,
  PrevState extends AnimationState = State
> = {
  /**
   * The animation function
   * state and timestamp
   * returns a boolean indicating if animation has finished or not
   * @worklet
   */
  onFrame: (animation: State, now: number) => boolean;
  /**
   * @worklet
   */
  onStart: (
    animation: State,
    value: number, // start value of animation
    now: number, // timestamp
    lastAnimation: PrevState // last animation running
  ) => void;
} & State;

type AnimationParameter<
  State extends AnimationState = AnimationState,
  PrevState extends AnimationState = AnimationState
> = Animation<State, PrevState> | (() => Animation<State, PrevState>) | number;

const animationParameter = <
  State extends AnimationState = AnimationState,
  PrevState extends AnimationState = AnimationState
>(
  animationParam: AnimationParameter<State, PrevState>
) => {
  "worklet";
  if (typeof animationParam === "number") {
    throw new Error("Expected Animation as parameter");
  }

  return typeof animationParam === "function"
    ? animationParam()
    : animationParam;
};

const defineAnimation = <
  State extends AnimationState = AnimationState,
  PrevState extends AnimationState = AnimationState
>(
  /**
   * @worklet
   */
  factory: () => Omit<Animation<State, PrevState>, keyof State>
) => {
  "worklet";
  if (_WORKLET) {
    return factory() as unknown as number;
  }

  return factory as unknown as number;
};

interface DecayAnimationState extends PhysicsAnimationState {
  lastTimestamp: number;
}

const VELOCITY_EPS = 5;
const deceleration = 0.997;

export const withDecay = (initialVelocity: number) => {
  "worklet";
  return defineAnimation<DecayAnimationState>(() => {
    "worklet";
    const onFrame = (state: DecayAnimationState, now: number) => {
      const { velocity, lastTimestamp, current } = state;
      const dt = now - lastTimestamp;
      const v0 = velocity / 1000;
      const kv = Math.pow(deceleration, dt);
      const v = v0 * kv * 1000;

      const x = current + (v0 * deceleration * (1 - kv)) / (1 - deceleration);

      state.velocity = v;
      state.current = x;
      state.lastTimestamp = now;

      if (Math.abs(v) < VELOCITY_EPS) {
        return true;
      }
      return false;
    };

    const onStart = (
      state: DecayAnimationState,
      current: number,
      now: number
    ) => {
      state.current = current;
      state.velocity = initialVelocity;
      state.lastTimestamp = now;
    };

    return {
      onFrame,
      onStart,
    };
  });
};

export const withBounce = (
  animationParam: AnimationParameter<PhysicsAnimationState>,
  lowerBound: number,
  upperBound: number
) => {
  "worklet";
  return defineAnimation<PhysicsAnimationState, Animation>(() => {
    "worklet";
    const nextAnimation = animationParameter(animationParam);
    const onFrame = (state: PhysicsAnimationState, now: number) => {
      const finished = nextAnimation.onFrame(nextAnimation, now);
      const { velocity, current } = nextAnimation;
      if (
        (velocity < 0 && current <= lowerBound) ||
        (velocity > 0 && current >= upperBound)
      ) {
        nextAnimation.velocity *= -0.5;
        nextAnimation.current = clamp(current, lowerBound, upperBound);
      }

      state.current = current;
      return finished;
    };
    const onStart = (
      _: PhysicsAnimationState,
      value: number,
      now: number,
      previousAnimation: Animation
    ) => {
      nextAnimation.onStart(nextAnimation, value, now, previousAnimation);
    };

    return {
      onFrame,
      onStart,
    };
  });
};

interface PausableAnimationState extends AnimationState {
  lastTimestamp: number;
  elapsed: number;
}

export const withPause = (
  animationParam: AnimationParameter,
  paused: Animated.SharedValue<boolean>
) => {
  "worklet";
  return defineAnimation<PausableAnimationState, PausableAnimationState>(() => {
    "worklet";
    const nextAnimation = animationParameter(animationParam);
    const onFrame = (state: PausableAnimationState, now: number) => {
      const { lastTimestamp, elapsed } = state;
      if (paused.value) {
        state.elapsed = now - lastTimestamp;
        return false;
      }

      const dt = now - elapsed;
      const finished = nextAnimation.onFrame(nextAnimation, dt);

      state.current = nextAnimation.current;
      state.lastTimestamp = dt;
      return finished;
    };

    const onStart = (
      state: PausableAnimationState,
      value: number,
      now: number,
      previousAnimation: PausableAnimationState
    ) => {
      state.elapsed = 0;
      state.current = 0;
      state.lastTimestamp = now;
      nextAnimation.onStart(nextAnimation, value, now, previousAnimation);
    };

    return {
      onFrame,
      onStart,
    };
  });
};
