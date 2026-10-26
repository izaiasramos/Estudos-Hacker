export type SceneTone = "neutral" | "accent" | "danger" | "defense";

export type SceneImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};

export type SceneBase = {
  id: string;
  eyebrow: string;
  title: string;
  accessibleSummary: string;
  caption?: string;
  tone?: SceneTone;
  image?: SceneImage;
};

export type SceneStep = {
  id: string;
  label: string;
  detail?: string;
};

export type FlowScene = SceneBase & {
  type: "flow";
  steps: readonly SceneStep[];
};

export type SequenceScene = SceneBase & {
  type: "sequence";
  events: readonly (SceneStep & { marker?: string })[];
};

export type BoundaryScene = SceneBase & {
  type: "boundary";
  zones: readonly {
    id: string;
    label: string;
    description?: string;
    items: readonly string[];
  }[];
};

export type CompareScene = SceneBase & {
  type: "compare";
  sides: readonly {
    id: string;
    label: string;
    description?: string;
    items: readonly string[];
  }[];
};

export type LifecycleScene = SceneBase & {
  type: "lifecycle";
  stages: readonly SceneStep[];
};

export type DecisionScene = SceneBase & {
  type: "decision";
  prompt: string;
  options: readonly {
    id: string;
    label: string;
    outcome: string;
    recommended?: boolean;
  }[];
};

export type UnitSceneConfig =
  | FlowScene
  | SequenceScene
  | BoundaryScene
  | CompareScene
  | LifecycleScene
  | DecisionScene;

export type SceneFallback = {
  title: string;
  summary: string;
};

export type SceneCatalog = Readonly<Record<string, UnitSceneConfig>>;
