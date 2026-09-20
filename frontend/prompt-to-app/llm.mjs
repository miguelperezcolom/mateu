// LLM adapters. The harness (generate.mjs) takes an `llm(messages, {system}) => Promise<string>`,
// so it stays testable with a fake. This is the real, PLUGGABLE edge — thin, and NOT covered by the
// unit tests (it needs a live API key); the verified core is the validate+repair loop.

/**
 * Anthropic Messages API adapter. Reads ANTHROPIC_API_KEY (and optional ANTHROPIC_MODEL) from env.
 * @param {{apiKey?:string, model?:string, maxTokens?:number, fetchImpl?:Function}} [opts]
 */
export function anthropicLlm(opts = {}) {
  const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
  const model = opts.model ?? process.env.ANTHROPIC_MODEL ?? "claude-opus-4-8";
  const maxTokens = opts.maxTokens ?? 4096;
  const doFetch = opts.fetchImpl ?? globalThis.fetch;
  if (!doFetch) throw new Error("global fetch unavailable (need Node 18+)");

  return async (messages, { system } = {}) => {
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");
    const res = await doFetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Anthropic ${res.status} ${res.statusText}${text ? ": " + text.slice(0, 400) : ""}`);
    }
    const data = await res.json();
    return (data.content ?? [])
      .filter((b) => b && b.type === "text")
      .map((b) => b.text)
      .join("");
  };
}

/** A scripted fake for tests/demos: returns the next canned reply on each call. */
export function scriptedLlm(replies) {
  let i = 0;
  return async () => replies[Math.min(i++, replies.length - 1)];
}
