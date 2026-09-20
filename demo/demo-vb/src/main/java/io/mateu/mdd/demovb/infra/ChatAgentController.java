package io.mateu.mdd.demovb.infra;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * The SSE endpoint behind {@code @AI(sse = "/agent/stream")} on {@link
 * io.mateu.mdd.demovb.infra.in.ui.VbHome}. It PROXIES the browser's chat request to a real agent
 * (server-side, so no CORS and the sseUrl stays a same-origin relative path — the VB chat prepends
 * the app base to the sseUrl, so an absolute cross-origin URL cannot be used from the client).
 *
 * <p>Default target is the local demo agent {@code frontend/promo/local-agent.mjs} on :8777, which
 * authors a Mateu definition (YAML) and emits a {@code render-screen} event; override with the env
 * var {@code MATEU_AGENT_STREAM_URL}. Each {@code data:} line from the upstream stream (plain text
 * chunks AND the {@code {event:"render-screen", detail:{yaml}}} event) is relayed verbatim, which is
 * exactly what the shared chat core (poc {@code streamChat}) consumes.
 */
@RestController
public class ChatAgentController {

  private static final ExecutorService POOL = Executors.newCachedThreadPool();
  private static final ObjectMapper MAPPER = new ObjectMapper();
  private static final HttpClient HTTP =
      HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

  @PostMapping(value = "/agent/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public SseEmitter stream(@RequestBody(required = false) Map<String, Object> body) {
    final SseEmitter emitter = new SseEmitter(120_000L);
    POOL.submit(
        () -> {
          try {
            String url =
                System.getenv()
                    .getOrDefault("MATEU_AGENT_STREAM_URL", "http://localhost:8777/agent/stream");
            HttpRequest req =
                HttpRequest.newBuilder(URI.create(url))
                    .timeout(Duration.ofSeconds(120))
                    .header("content-type", "application/json")
                    .POST(
                        HttpRequest.BodyPublishers.ofString(
                            MAPPER.writeValueAsString(body == null ? Map.of() : body)))
                    .build();
            HttpResponse<java.util.stream.Stream<String>> resp =
                HTTP.send(req, HttpResponse.BodyHandlers.ofLines());
            resp.body()
                .forEach(
                    line -> {
                      String t = line.trim();
                      if (t.startsWith("data:")) {
                        try {
                          emitter.send(SseEmitter.event().data(t.substring(5).trim()));
                        } catch (Exception ignore) {
                          // client went away
                        }
                      }
                    });
            emitter.complete();
          } catch (Exception e) {
            try {
              emitter.send(
                  SseEmitter.event()
                      .data("{\"event\":\"agent-error\",\"detail\":{\"message\":\"agent unreachable\"}}"));
            } catch (Exception ignore) {
              // ignore
            }
            emitter.completeWithError(e);
          }
        });
    return emitter;
  }
}
