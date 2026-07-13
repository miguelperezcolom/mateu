package io.mateu.agent.cli;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * The pseudo-agent for local development: serves the chat's SSE contract by bridging to an LLM CLI
 * already authenticated on this machine (claude, gemini…), so the app needs NO api key. Point the
 * shell's {@code @AI(sse = "/mateu/agent/stream")} here — a relative URL keeps it same-origin.
 * Meant for localhost: an exposed server should run a real agent.
 */
@RestController
public class CliAgentController {

  /**
   * menuContext stays an Object on purpose: the host may run Jackson 2 or Jackson 3 (Spring 7), and
   * either one binds plain maps/lists happily.
   */
  public record ChatRequest(String message, String sessionId, Object menuContext, Object context) {}

  private final CliAgentService service;

  public CliAgentController(CliAgentService service) {
    this.service = service;
  }

  private final ExecutorService executor =
      Executors.newCachedThreadPool(
          r -> {
            var t = new Thread(r, "mateu-agent-cli");
            t.setDaemon(true);
            return t;
          });

  @PostMapping(
      value = "${mateu.agent.cli.path:/mateu/agent/stream}",
      produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter stream(@RequestBody ChatRequest request) {
    var emitter = new SseEmitter(0L);
    executor.submit(() -> service.run(request, emitter));
    return emitter;
  }
}
