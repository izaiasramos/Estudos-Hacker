"use client";

import { useRef } from "react";

type CodeEditorProps = {
  id: string;
  name?: string;
  fileName: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: number;
};

export function DarkPlusCodeEditor({ id, name, fileName, value, onChange, minHeight = 15 }: CodeEditorProps) {
  const lines = value.split("\n");
  const highlightRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const height = `${Math.min(34, Math.max(minHeight, (lines.length + 2) * 1.5 + 2))}rem`;

  function syncScroll(element: HTMLTextAreaElement) {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = element.scrollTop;
      highlightRef.current.scrollLeft = element.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.scrollTop = element.scrollTop;
  }

  return <div className="overflow-hidden rounded-[16px] border border-[#3c3c3c] bg-[#1e1e1e] shadow-[0_18px_45px_rgba(0,0,0,0.35)] focus-within:border-[#007acc] focus-within:ring-2 focus-within:ring-[#007acc]/35">
    <div className="flex items-center gap-2 border-b border-[#3c3c3c] bg-[#181818] px-4 py-2"><span className="size-3 rounded-full bg-[#f14c4c]"/><span className="size-3 rounded-full bg-[#cca700]"/><span className="size-3 rounded-full bg-[#23d18b]"/><span className="ml-2 font-mono text-xs text-[#cccccc]">{fileName}</span></div>
    <div className="relative overflow-hidden" style={{ height }}>
      <div ref={gutterRef} aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-20 w-12 select-none overflow-hidden border-r border-[#3c3c3c] bg-[#181818] py-4 text-right font-mono text-[15px] leading-6 text-[#858585]">{lines.map((_, index) => <div key={index} className="pr-3">{index + 1}</div>)}</div>
      <pre ref={highlightRef} aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#1e1e1e] py-4 pr-4 pl-16 font-mono text-[15px] font-medium leading-6 whitespace-pre [tab-size:2]"><code>{lines.map((line, index) => <span key={index} className="block h-6"><DarkPlusLine code={line || " "} nowrap /></span>)}</code></pre>
      <label className="sr-only" htmlFor={id}>Editor de código {fileName}</label>
      <textarea id={id} name={name} value={value} onChange={(event) => onChange(event.target.value)} onScroll={(event) => syncScroll(event.currentTarget)} spellCheck={false} wrap="off" className="code-editor-input absolute inset-0 z-10 size-full resize-none overflow-auto bg-transparent py-4 pr-4 pl-16 font-mono text-[15px] font-medium leading-6 text-transparent caret-[#ffffff] outline-none [tab-size:2]" />
    </div>
  </div>;
}

export function DarkPlusCode({ code }: { code: string }) {
  return <pre className="mt-3 overflow-x-auto bg-transparent p-0 font-mono text-[14px] leading-6"><code>{code.split("\n").map((line, index) => <span key={index} className="block"><DarkPlusLine code={line} /></span>)}</code></pre>;
}

export function DarkPlusLine({ code, nowrap = false }: { code: string; nowrap?: boolean }) {
  const tokens = tokenizeJavaScript(code);
  return <code className={nowrap ? "whitespace-pre" : "whitespace-pre-wrap break-words"}>{tokens.map((token, index) => <span key={`${token.text}:${index}`} style={{ color: token.color }}>{token.text}</span>)}</code>;
}

type ColoredToken = { text: string; color: string };
const DARK_PLUS = { keyword: "#c586c0", function: "#dcdcaa", identifier: "#9cdcfe", type: "#4ec9b0", string: "#ce9178", number: "#b5cea8", constant: "#569cd6", comment: "#6a9955", punctuation: "#d4d4d4" };

function tokenizeJavaScript(line: string): ColoredToken[] {
  const parts = line.match(/\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b\d+(?:\.\d+)?\b|\?\.|\?\?|!==|===|!=|==|=>|&&|\|\||[A-Za-z_$][\w$]*|\s+|./g) ?? [];
  const parameters = functionParameters(line);
  return parts.map((text, index) => {
    const previous = previousMeaningful(parts, index);
    const next = nextMeaningful(parts, index);
    if (text.startsWith("//")) return { text, color: DARK_PLUS.comment };
    if (/^["']/.test(text)) return { text, color: DARK_PLUS.string };
    if (/^\d/.test(text)) return { text, color: DARK_PLUS.number };
    if (/^(async|await|function|const|let|var|return|if|else|new|throw|class|try|catch|for|while|import|from|export|default)$/.test(text)) return { text, color: DARK_PLUS.keyword };
    if (/^(true|false|null|undefined)$/.test(text)) return { text, color: DARK_PLUS.constant };
    if (/^(Response|URL|Error|Promise|Map|Set|String|Number|Boolean|Object|Array)$/.test(text)) return { text, color: DARK_PLUS.type };
    if (/^[A-Za-z_$]/.test(text)) {
      if (next === "(" && previous !== "function" && previous !== "." && previous !== "?.") return { text, color: DARK_PLUS.function };
      if (previous === "function") return { text, color: DARK_PLUS.function };
      if (parameters.has(text) || previous === "." || previous === "?.") return { text, color: DARK_PLUS.identifier };
      return { text, color: DARK_PLUS.identifier };
    }
    return { text, color: DARK_PLUS.punctuation };
  });
}

function functionParameters(line: string) { const match = line.match(/function\s+\w+\s*\(([^)]*)\)/); return new Set((match?.[1] ?? "").split(",").map((value) => value.trim()).filter(Boolean)); }
function previousMeaningful(parts: string[], index: number) { for (let current = index - 1; current >= 0; current -= 1) if (!/^\s+$/.test(parts[current])) return parts[current]; return ""; }
function nextMeaningful(parts: string[], index: number) { for (let current = index + 1; current < parts.length; current += 1) if (!/^\s+$/.test(parts[current])) return parts[current]; return ""; }
