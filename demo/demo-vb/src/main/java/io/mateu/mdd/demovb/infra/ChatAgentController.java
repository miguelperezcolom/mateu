package io.mateu.mdd.demovb.infra;

import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * DEMO AI agent — the SSE endpoint behind {@code @AI(sse = "/agent/stream")} on {@link
 * io.mateu.mdd.demovb.infra.in.ui.VbHome}. It is a MOCK (no LLM): it echoes the user's message back
 * token by token so the VB chat panel can be exercised end to end (type → stream → render) without a
 * real agent. Point {@code @AI(sse=...)} at a real endpoint to replace it.
 *
 * <p>Contract (the shared mateu-chat / poc chat core): POST JSON {@code {message, sessionId, …}} →
 * {@code text/event-stream} of {@code data:} chunks the client accumulates into the assistant reply.
 */
@RestController
public class ChatAgentController {

  private static final ExecutorService POOL = Executors.newCachedThreadPool();

  @PostMapping(value = "/agent/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter stream(@RequestBody(required = false) Map<String, Object> body) {
    final String message = body == null ? "" : String.valueOf(body.getOrDefault("message", ""));
    final SseEmitter emitter = new SseEmitter(60_000L);
    POOL.submit(
        () -> {
          try {
            // Sentence-level chunks so most spacing survives the client's per-payload trim; the
            // delay makes the streaming visible. A real agent streams its own tokens here.
            String[] chunks = {
              "You said: \"" + message + "\".",
              "I'm the demo agent for the VB chat panel.",
              "This reply is streamed over SSE, chunk by chunk,",
              "so you can see the conversation surface update live.",
            };
            for (String chunk : chunks) {
              emitter.send(SseEmitter.event().data(chunk));
              Thread.sleep(220);
            }
            emitter.complete();
          } catch (Exception e) {
            emitter.completeWithError(e);
          }
        });
    return emitter;
  }
}
