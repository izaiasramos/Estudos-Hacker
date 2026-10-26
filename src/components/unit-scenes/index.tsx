import Image from "next/image";
import type { CSSProperties } from "react";
import { InlineCode } from "@/components/inline-code";
import { SceneReveal } from "@/components/unit-scenes/scene-reveal";
import type {
  BoundaryScene,
  CompareScene,
  DecisionScene,
  FlowScene,
  LifecycleScene,
  SequenceScene,
  UnitSceneConfig,
} from "@/content/scenes";

function Flow({ scene }: { scene: FlowScene }) {
  return (
    <ol className="unit-scene-track" role="list" aria-label="Etapas do fluxo">
      {scene.steps.map((step, index) => (
        <li className="unit-scene-node" key={step.id} style={{ "--scene-order": index } as CSSProperties}>
          <span className="unit-scene-index" aria-hidden>{index + 1}</span>
          <div><strong><InlineCode text={step.label} /></strong>{step.detail ? <p><InlineCode text={step.detail} /></p> : null}</div>
        </li>
      ))}
    </ol>
  );
}

function Sequence({ scene }: { scene: SequenceScene }) {
  return (
    <ol className="unit-scene-sequence" role="list" aria-label="Sequência de eventos">
      {scene.events.map((event, index) => (
        <li className="unit-scene-node" key={event.id} style={{ "--scene-order": index } as CSSProperties}>
          <span className="unit-scene-marker" aria-hidden>{event.marker ?? String(index + 1).padStart(2, "0")}</span>
          <div><strong><InlineCode text={event.label} /></strong>{event.detail ? <p><InlineCode text={event.detail} /></p> : null}</div>
        </li>
      ))}
    </ol>
  );
}

function Boundary({ scene }: { scene: BoundaryScene }) {
  return (
    <div className="unit-scene-zones" role="group" aria-label="Limites e zonas">
      {scene.zones.map((zone, index) => (
        <section className="unit-scene-zone" key={zone.id} style={{ "--scene-order": index } as CSSProperties}>
          <h3>{zone.label}</h3>
          {zone.description ? <p>{zone.description}</p> : null}
          <ul role="list">{zone.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ))}
    </div>
  );
}

function Compare({ scene }: { scene: CompareScene }) {
  return (
    <div className="unit-scene-compare" role="group" aria-label="Comparação lado a lado">
      {scene.sides.map((side, index) => (
        <section className="unit-scene-side" key={side.id} style={{ "--scene-order": index } as CSSProperties}>
          <h3>{side.label}</h3>
          {side.description ? <p>{side.description}</p> : null}
          <ul role="list">{side.items.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      ))}
    </div>
  );
}

function Lifecycle({ scene }: { scene: LifecycleScene }) {
  return (
    <ol className="unit-scene-cycle" role="list" aria-label="Estágios do ciclo de vida">
      {scene.stages.map((stage, index) => (
        <li className="unit-scene-node" key={stage.id} style={{ "--scene-order": index } as CSSProperties}>
          <span className="unit-scene-index" aria-hidden>{index + 1}</span>
          <div><strong>{stage.label}</strong>{stage.detail ? <p>{stage.detail}</p> : null}</div>
        </li>
      ))}
    </ol>
  );
}

function Decision({ scene }: { scene: DecisionScene }) {
  return (
    <div className="unit-scene-decision">
      <p className="unit-scene-prompt">{scene.prompt}</p>
      <ul role="list" aria-label="Opções e consequências">
        {scene.options.map((option, index) => (
          <li className="unit-scene-option" data-recommended={option.recommended || undefined} key={option.id} style={{ "--scene-order": index } as CSSProperties}>
            <strong>{option.label}</strong>
            {option.recommended ? <span className="unit-scene-badge">Caminho recomendado</span> : null}
            <p>{option.outcome}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SceneBody({ scene }: { scene: UnitSceneConfig }) {
  switch (scene.type) {
    case "flow": return <Flow scene={scene} />;
    case "sequence": return <Sequence scene={scene} />;
    case "boundary": return <Boundary scene={scene} />;
    case "compare": return <Compare scene={scene} />;
    case "lifecycle": return <Lifecycle scene={scene} />;
    case "decision": return <Decision scene={scene} />;
  }
}

export function UnitScene({ scene }: { scene: UnitSceneConfig }) {
  const titleId = `${scene.id}-title`;

  return (
    <SceneReveal
      sceneId={scene.id}
      tone={scene.tone ?? "neutral"}
      labelledBy={titleId}
    >
      <header className="unit-scene-header">
        <p className="unit-scene-eyebrow">{scene.eyebrow}</p>
        <h2 id={titleId}><InlineCode text={scene.title} /></h2>
        <p className="unit-scene-summary"><InlineCode text={scene.accessibleSummary} /></p>
      </header>
      <div className="unit-scene-canvas"><SceneBody scene={scene} /></div>
      {scene.image ? (
        <div className="unit-scene-image">
          <Image
            src={scene.image.src}
            alt={scene.image.alt}
            width={scene.image.width}
            height={scene.image.height}
            sizes="(max-width: 640px) calc(100vw - 3rem), 640px"
          />
          {scene.image.caption ? <p>{scene.image.caption}</p> : null}
        </div>
      ) : null}
      <figcaption><InlineCode text={scene.caption ?? scene.accessibleSummary} /></figcaption>
    </SceneReveal>
  );
}
