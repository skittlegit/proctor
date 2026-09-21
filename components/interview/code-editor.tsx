"use client";

import { HighlightStyle, syntaxHighlighting, type LanguageSupport } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { languages } from "@codemirror/language-data";
import { tags } from "@lezer/highlight";
import CodeMirror from "@uiw/react-codemirror";
import { useEffect, useMemo, useState } from "react";

import { codeLanguages, type CodeLanguage } from "./config";

const languageDescriptions = new Map(
  languages.map((language) => [language.name, language]),
);

const editorTheme = EditorView.theme({
  "&": {
    height: "100%",
    backgroundColor: "var(--code-surface)",
    color: "var(--foreground)",
    fontSize: "var(--editor-font-size, 0.9375rem)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Consolas, monospace",
    lineHeight: "1.75rem",
    overflow: "auto",
  },
  ".cm-content": {
    caretColor: "var(--foreground)",
    padding: "0.75rem 0 5rem",
  },
  ".cm-line": { padding: "0 1rem" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--foreground)" },
  ".cm-gutters": {
    backgroundColor: "var(--code-gutter)",
    color: "var(--ink-soft)",
    borderRight: "1px solid var(--code-line)",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    minWidth: "2.75rem",
    padding: "0 0.75rem 0 0.5rem",
  },
  ".cm-activeLine": { backgroundColor: "var(--editor-active-line)" },
  ".cm-activeLineGutter": {
    backgroundColor: "var(--editor-active-line)",
    color: "var(--foreground)",
    fontWeight: "600",
  },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection": {
    backgroundColor: "var(--editor-selection) !important",
  },
  ".cm-matchingBracket": {
    backgroundColor: "var(--brand-soft)",
    outline: "1px solid var(--line)",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "var(--surface-soft)",
    border: "1px solid var(--line)",
    color: "var(--muted)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--surface)",
    border: "1px solid var(--line)",
    color: "var(--foreground)",
  },
  ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
    backgroundColor: "var(--brand-soft)",
    color: "var(--foreground)",
  },
  ".cm-panels": {
    backgroundColor: "var(--surface-soft)",
    color: "var(--foreground)",
  },
});

const editorHighlightStyle = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.modifier, tags.meta], color: "var(--syntax-keyword)", fontWeight: "600" },
  { tag: tags.comment, color: "var(--syntax-comment)", fontStyle: "normal" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "var(--syntax-function)" },
  { tag: [tags.string, tags.character], color: "var(--syntax-string)" },
  { tag: [tags.number, tags.bool, tags.null], color: "var(--syntax-number)" },
  { tag: [tags.typeName, tags.className], color: "var(--syntax-type)" },
]);

const readOnlyTheme = EditorView.theme({
  ".cm-content": { paddingBottom: "0.75rem" },
});

const sharedExtensions = [
  editorTheme,
  syntaxHighlighting(editorHighlightStyle),
];

export default function CodeEditor({
  code,
  language,
  onChange,
  readOnly = false,
}: {
  code: string;
  language: CodeLanguage;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}) {
  const languageConfig = codeLanguages[language];
  const [languageSupport, setLanguageSupport] = useState<LanguageSupport | null>(null);

  useEffect(() => {
    let active = true;

    const description = languageDescriptions.get(languageConfig.syntaxName);
    if (!description) return () => { active = false; };

    void description.load().then((support) => {
      if (active) setLanguageSupport(support);
    });

    return () => { active = false; };
  }, [languageConfig.syntaxName]);

  const extensions = useMemo(
    () => [
      ...sharedExtensions,
      EditorView.contentAttributes.of(readOnly
        ? { "aria-label": `Submitted ${languageConfig.label} solution, read only` }
        : {
            "aria-label": `${languageConfig.label} code editor`,
            "aria-describedby": "editor-keyboard-help",
          }),
      ...(readOnly ? [readOnlyTheme] : []),
      ...(languageSupport ? [languageSupport] : []),
    ],
    [languageConfig.label, languageSupport, readOnly],
  );

  return (
    <CodeMirror
      value={code}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      extensions={extensions}
      theme="none"
      height="100%"
      indentWithTab={!readOnly}
      basicSetup={{
        autocompletion: false,
        bracketMatching: true,
        closeBrackets: true,
        foldGutter: true,
        highlightActiveLine: false,
        highlightActiveLineGutter: false,
        highlightSelectionMatches: true,
        indentOnInput: true,
        lineNumbers: true,
        syntaxHighlighting: false,
      }}
      className={readOnly
        ? "min-h-0 flex-1 overflow-hidden bg-code-surface"
        : "min-h-[46svh] flex-1 overflow-hidden bg-code-surface sm:min-h-[380px] md:min-h-0"}
    />
  );
}
