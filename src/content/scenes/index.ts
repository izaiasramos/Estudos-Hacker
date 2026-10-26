import { TRAILS } from "@/content/trails";
import { authenticationScenes } from "./autenticacao";
import { accessControlScenes } from "./controle-acesso";
import { csrfScenes } from "./csrf";
import { headersScenes } from "./headers";
import { phishingScenes } from "./phishing";
import { sessionScenes } from "./sessao";
import { sqlInjectionScenes } from "./sql-injection";
import { ssrfScenes } from "./ssrf";
import { uploadScenes } from "./upload";
import type { FlowScene, SceneCatalog, SceneFallback, UnitSceneConfig } from "./types";
import { xssScenes } from "./xss";

export type {
  BoundaryScene,
  CompareScene,
  DecisionScene,
  FlowScene,
  LifecycleScene,
  SceneBase,
  SceneCatalog,
  SceneFallback,
  SceneImage,
  SceneStep,
  SceneTone,
  SequenceScene,
  UnitSceneConfig,
} from "./types";

const sceneKey = (trailSlug: string, unitId: string) => `${trailSlug}:${unitId}`;

/** Catálogos editoriais separados por trilha; adicionar uma trilha exige apenas incluí-la aqui. */
const SCENE_CATALOGS: readonly SceneCatalog[] = [
  sqlInjectionScenes,
  sessionScenes,
  authenticationScenes,
  xssScenes,
  csrfScenes,
  phishingScenes,
  accessControlScenes,
  headersScenes,
  ssrfScenes,
  uploadScenes,
];

function mergeSceneCatalogs(catalogs: readonly SceneCatalog[]): SceneCatalog {
  const merged: Record<string, UnitSceneConfig> = {};
  const sceneIds = new Set<string>();

  for (const catalog of catalogs) {
    for (const [key, scene] of Object.entries(catalog)) {
      if (key in merged) throw new Error(`Cena duplicada para a unidade ${key}.`);
      if (sceneIds.has(scene.id)) throw new Error(`Identificador de cena duplicado: ${scene.id}.`);
      merged[key] = scene;
      sceneIds.add(scene.id);
    }
  }

  return Object.freeze(merged);
}

const SCENES = mergeSceneCatalogs(SCENE_CATALOGS);

function validatePublishedCoverage() {
  const expected = new Set(
    TRAILS.filter((trail) => trail.status !== "rascunho").flatMap((trail) =>
      trail.units.map((unit) => sceneKey(trail.slug, unit.id)),
    ),
  );

  for (const key of expected) {
    if (!(key in SCENES)) throw new Error(`A unidade publicada ${key} não possui cena didática.`);
  }
  for (const key of Object.keys(SCENES)) {
    if (!expected.has(key)) throw new Error(`A cena ${key} não corresponde a uma unidade publicada.`);
  }
}

validatePublishedCoverage();

function fallbackScene(trailSlug: string, unitId: string, fallback?: SceneFallback): FlowScene {
  const title = fallback?.title.trim() || "Visão geral da unidade";
  const summary = fallback?.summary.trim() || "Explore os conceitos centrais desta unidade antes de avançar.";

  return {
    id: `fallback-${trailSlug}-${unitId}`,
    type: "flow",
    eyebrow: "Mapa da unidade",
    title,
    accessibleSummary: `Cena introdutória de ${title}. ${summary}`,
    caption: "Cena gerada automaticamente enquanto o diagrama específico desta unidade não foi publicado.",
    tone: "neutral",
    steps: [
      { id: "context", label: "Contexto", detail: title },
      { id: "focus", label: "Foco", detail: summary },
      { id: "practice", label: "Aplicação", detail: "Conecte a ideia ao conteúdo e à prática da unidade." },
    ],
  };
}

export function sceneFor(trailSlug: string, unitId: string, fallback?: SceneFallback): UnitSceneConfig {
  return SCENES[sceneKey(trailSlug, unitId)] ?? fallbackScene(trailSlug, unitId, fallback);
}
