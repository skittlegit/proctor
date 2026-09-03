"use client";

import { HighlightStyle, syntaxHighlighting, syntaxTree, type LanguageSupport } from "@codemirror/language";
import { lintGutter, linter, type Diagnostic } from "@codemirror/lint";
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
    fontSize: "0.875rem",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "var(--font-geist-mono), ui-monospace, SFMono-Regular, Consolas, monospace",
    lineHeight: "1.5rem",
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
    color: "var(--muted)",
    borderRight: "1px solid var(--code-line)",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    minWidth: "2.75rem",
    padding: "0 0.75rem 0 0.5rem",
  },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "transparent" },
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
  ".cm-lintRange-error": {
    backgroundImage: "none",
    borderBottom: "2px dotted var(--danger)",
  },
  ".cm-diagnostic-error": { borderLeftColor: "var(--danger)" },
});

const editorHighlightStyle = HighlightStyle.define([
  { tag: [tags.keyword, tags.controlKeyword, tags.modifier], color: "var(--syntax-keyword)", fontWeight: "600" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "var(--foreground)", fontWeight: "600" },
  { tag: [tags.propertyName, tags.attributeName], color: "var(--ink-soft)" },
  { tag: [tags.typeName, tags.className, tags.namespace], color: "var(--foreground)", fontWeight: "600" },
  { tag: [tags.string, tags.special(tags.string)], color: "var(--syntax-string)" },
  { tag: [tags.bool, tags.null, tags.meta], color: "var(--syntax-keyword)" },
  { tag: tags.number, color: "var(--syntax-number)" },
  { tag: tags.comment, color: "var(--syntax-comment)", fontStyle: "italic" },
  { tag: [tags.operator, tags.punctuation], color: "var(--ink-soft)" },
  { tag: [tags.regexp, tags.escape], color: "var(--syntax-string)" },
  { tag: [tags.invalid], color: "var(--danger)", textDecoration: "underline" },
]);

const syntaxErrorLinter = linter(
  (view) => {
    const diagnostics: Diagnostic[] = [];

    syntaxTree(view.state).iterate({
      enter(node) {
        if (!node.type.isError) return;
        diagnostics.push({
          from: node.from,
          to: Math.max(node.from + 1, node.to),
          severity: "error",
          message: "Check the syntax near this token.",
        });
      },
    });

    return diagnostics;
  },
  { delay: 450 },
);

const sharedExtensions = [
  editorTheme,
  syntaxHighlighting(editorHighlightStyle),
  lintGutter(),
  syntaxErrorLinter,
];

export default function CodeEditor({
  code,
  language,
  onChange,
}: {
  code: string;
  language: CodeLanguage;
  onChange: (value: string) => void;
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
      EditorView.contentAttributes.of({
        "aria-label": `${languageConfig.label} code editor`,
        "aria-describedby": "editor-keyboard-help",
      }),
      ...(languageSupport ? [languageSupport] : []),
    ],
    [languageConfig.label, languageSupport],
  );

  return (
    <CodeMirror
      value={code}
      onChange={onChange}
      extensions={extensions}
      theme="none"
      height="100%"
      indentWithTab
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
      }}
      className="min-h-[46svh] flex-1 overflow-hidden bg-code-surface sm:min-h-[380px] md:min-h-0"
    />
  );
}
