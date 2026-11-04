package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import lombok.Builder;

/**
 * The app's AI assistant chat — the data twin of {@code @AI} (YAML: the app shell's {@code ai:}
 * block).
 *
 * <pre>
 * ai:
 *   sse: /api/ai/chat
 *   mcp: /api/ai/mcp
 *   followLabel: Follow the copilot
 *   followingLabel: Following the copilot
 * </pre>
 *
 * @param sse the SSE chat endpoint; blank = no chat
 * @param mcp the app's MCP endpoint, forwarded with every message; blank = none
 * @param upload where the chat POSTs attached files; blank = no attachments
 * @param followLabel the Follow mode button's text while it is OFF; blank = "Follow" / "Seguir"
 * @param followingLabel the Follow mode button's text while it is ON; blank = "Following" /
 *     "Siguiendo"
 */
@Builder
@Experimental("AI chat panel and MCP wiring")
public record AppAiChat(
    String sse, String mcp, String upload, String followLabel, String followingLabel) {}
