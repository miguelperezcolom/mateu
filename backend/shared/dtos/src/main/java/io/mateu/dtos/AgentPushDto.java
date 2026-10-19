package io.mateu.dtos;

import java.util.Map;

/**
 * One message an MCP caller sent to a live UI session (live UI push), carried by an {@code
 * AgentPush} command on the {@code _agent-channel} stream.
 *
 * @param kind {@code status}, {@code render}, {@code navigate} or {@code event}
 * @param event the UI event the message is: {@code mateu-agent-status}, {@code render-screen},
 *     {@code navigation-requested} or the dispatched event's own name — the same catalogue as the
 *     chat's stream, so a UI applies a pushed message exactly like a chat event
 * @param detail the event's detail
 */
public record AgentPushDto(String kind, String event, Map<String, Object> detail) {}
