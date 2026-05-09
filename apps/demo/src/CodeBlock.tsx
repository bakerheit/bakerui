import { useState, type ReactNode } from "react";

type TokenType =
  | "comment"
  | "string"
  | "keyword"
  | "boolean"
  | "number"
  | "component"
  | "tag"
  | "tag-bracket"
  | "attribute"
  | "function"
  | "punctuation"
  | "text";

interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS = new Set([
  "const",
  "let",
  "var",
  "function",
  "return",
  "import",
  "from",
  "export",
  "default",
  "async",
  "await",
  "if",
  "else",
  "for",
  "while",
  "new",
  "class",
  "extends",
  "this",
  "typeof",
  "in",
  "of",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "throw",
  "try",
  "catch",
  "finally",
  "interface",
  "type",
]);

const BOOLEANS = new Set(["true", "false", "null", "undefined"]);

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  // Track JSX tag state. `inTag` means we're between a tag's `<` and its `>`.
  // `tagExprDepth` counts open `{` braces inside a tag's attribute expression
  // (e.g., `onClick={() => …}`) so that `>` inside an arrow function isn't
  // treated as the tag close.
  let inTag = false;
  let tagExprDepth = 0;

  while (i < source.length) {
    const ch = source[i];
    const rest = source.slice(i);

    // {/* ... */} JSX comment
    if (rest.startsWith("{/*")) {
      const end = rest.indexOf("*/}");
      if (end !== -1) {
        tokens.push({ type: "comment", value: rest.slice(0, end + 3) });
        i += end + 3;
        continue;
      }
    }
    // /* ... */ JS block comment
    if (rest.startsWith("/*")) {
      const end = rest.indexOf("*/", 2);
      const stop = end === -1 ? rest.length : end + 2;
      tokens.push({ type: "comment", value: rest.slice(0, stop) });
      i += stop;
      continue;
    }
    // // line comment
    if (rest.startsWith("//")) {
      const end = rest.indexOf("\n");
      const stop = end === -1 ? rest.length : end;
      tokens.push({ type: "comment", value: rest.slice(0, stop) });
      i += stop;
      continue;
    }

    // Strings (double, single, backtick).
    // Backticks may span newlines; ' and " must close on the same line — this
    // prevents an apostrophe in JSX children (e.g., "There's") from swallowing
    // the rest of the source as one giant unterminated string.
    if (ch === '"' || ch === "'" || ch === "`") {
      const quote = ch;
      let j = i + 1;
      let closed = false;
      while (j < source.length) {
        const cj = source[j];
        if (cj === "\\") {
          j += 2;
          continue;
        }
        if (cj === quote) {
          closed = true;
          break;
        }
        if (cj === "\n" && quote !== "`") break;
        j += 1;
      }
      if (closed) {
        tokens.push({ type: "string", value: source.slice(i, j + 1) });
        i = j + 1;
        continue;
      }
      // Unclosed quote — fall through and treat as plain text.
    }

    // Track brace depth inside a tag so `=>` doesn't terminate the tag.
    if (inTag && ch === "{") {
      tagExprDepth += 1;
      tokens.push({ type: "punctuation", value: ch });
      i += 1;
      continue;
    }
    if (inTag && ch === "}" && tagExprDepth > 0) {
      tagExprDepth -= 1;
      tokens.push({ type: "punctuation", value: ch });
      i += 1;
      continue;
    }

    // Tag opening: only when we aren't already inside a tag.
    if (!inTag) {
      if (ch === "<" && /[a-zA-Z]/.test(source[i + 1] ?? "")) {
        tokens.push({ type: "tag-bracket", value: "<" });
        i += 1;
        inTag = true;
        tagExprDepth = 0;
        continue;
      }
      if (rest.startsWith("</") && /[a-zA-Z]/.test(source[i + 2] ?? "")) {
        tokens.push({ type: "tag-bracket", value: "</" });
        i += 2;
        inTag = true;
        tagExprDepth = 0;
        continue;
      }
    }

    // Tag close — only when not inside an attribute expression.
    if (inTag && tagExprDepth === 0) {
      if (rest.startsWith("/>")) {
        tokens.push({ type: "tag-bracket", value: "/>" });
        i += 2;
        inTag = false;
        continue;
      }
      if (ch === ">") {
        tokens.push({ type: "tag-bracket", value: ">" });
        i += 1;
        inTag = false;
        continue;
      }
    }

    // Numbers
    const numMatch = rest.match(/^\d+(?:\.\d+)?/);
    if (numMatch) {
      tokens.push({ type: "number", value: numMatch[0] });
      i += numMatch[0].length;
      continue;
    }

    // Identifiers
    const idMatch = rest.match(/^[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*/);
    if (idMatch) {
      const value = idMatch[0];
      const next = source[i + value.length] ?? "";
      const inTagHeader = inTag && tagExprDepth === 0;
      let type: TokenType;

      if (BOOLEANS.has(value)) {
        type = "boolean";
      } else if (KEYWORDS.has(value)) {
        type = "keyword";
      } else if (inTagHeader) {
        // First identifier after `<` is the tag name. Subsequent identifiers
        // before `=` are attribute names.
        const last = tokens[tokens.length - 1];
        if (last?.type === "tag-bracket" && (last.value === "<" || last.value === "</")) {
          type = /^[A-Z]/.test(value) || value.includes(".") ? "component" : "tag";
        } else {
          type = "attribute";
        }
      } else if (/^[A-Z]/.test(value)) {
        // Capitalized identifier outside a tag — e.g., a referenced component or constructor.
        type = "component";
      } else if (next === "(") {
        type = "function";
      } else {
        type = "text";
      }

      tokens.push({ type, value });
      i += value.length;
      continue;
    }

    // Punctuation / operators (single char fallback)
    if (/[{}()\[\];,.=+\-*/&|!?:<>%~^]/.test(ch)) {
      tokens.push({ type: "punctuation", value: ch });
      i += 1;
      continue;
    }

    // Whitespace and anything else
    tokens.push({ type: "text", value: ch });
    i += 1;
  }

  return tokens;
}

function renderTokens(tokens: Token[]): ReactNode[] {
  return tokens.map((tok, idx) =>
    tok.type === "text" ? (
      <span key={idx}>{tok.value}</span>
    ) : (
      <span key={idx} className={`bui-syntax-${tok.type}`}>
        {tok.value}
      </span>
    ),
  );
}

export interface CodeBlockProps {
  code: string;
  filename?: string;
  language?: string;
}

export function CodeBlock({ code, filename = "Example.tsx", language = "tsx" }: CodeBlockProps) {
  const trimmed = code.trim();
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(trimmed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      // ignore
    }
  };

  const tokens = tokenize(trimmed);
  return (
    <figure className="demo-codeblock">
      <header className="demo-codeblock__chrome">
        <span className="demo-codeblock__dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
        <span className="demo-codeblock__filename">{filename}</span>
        <span className="demo-codeblock__language">{language}</span>
        <button type="button" className="demo-codeblock__copy" onClick={onCopy}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </header>
      <pre className="demo-codeblock__pre">
        <code className="demo-codeblock__code">{renderTokens(tokens)}</code>
      </pre>
    </figure>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="4" width="8" height="8" rx="1.5" />
      <path d="M2 10V3a1 1 0 011-1h7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 7.5l2.8 2.8L11.5 4" />
    </svg>
  );
}
