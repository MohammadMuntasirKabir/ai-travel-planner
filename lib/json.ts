// Robust JSON extraction from AI model output.
//
// Models frequently wrap JSON in markdown code fences, add prose, or include
// trailing commas. This helper strips fences and tolerates surrounding text by
// extracting the first balanced JSON object or array.

export function extractJson(raw: string): unknown {
  if (typeof raw !== "string") {
    throw new Error("AI response was empty or not a string");
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("AI response was empty");
  }

  // Fast path: try the whole thing first.
  const direct = tryParse(trimmed);
  if (direct !== undefined) return direct;

  // Strip ```json ... ``` or ``` ... ``` fences.
  const fenced = trimmed.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  const fencedParsed = tryParse(fenced.trim());
  if (fencedParsed !== undefined) return fencedParsed;

  // Fall back to locating the first balanced { ... } or [ ... ].
  const objectResult = extractBalanced(trimmed, "{", "}");
  if (objectResult !== undefined) return objectResult;

  const arrayResult = extractBalanced(trimmed, "[", "]");
  if (arrayResult !== undefined) return arrayResult;

  throw new Error("AI response did not contain valid JSON");
}

function tryParse(text: string): unknown | undefined {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

// Extract the first substring that starts at the first `open` and ends at its
// matching `close`, ignoring brackets inside strings.
function extractBalanced(text: string, open: string, close: string): unknown | undefined {
  const start = text.indexOf(open);
  if (start === -1) return undefined;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const char = text[i];

    if (escape) {
      escape = false;
      continue;
    }
    if (char === "\\") {
      escape = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === open) depth++;
    else if (char === close) {
      depth--;
      if (depth === 0) {
        return tryParse(text.slice(start, i + 1));
      }
    }
  }

  return undefined;
}
