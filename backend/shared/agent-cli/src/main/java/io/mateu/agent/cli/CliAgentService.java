package io.mateu.agent.cli;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

/**
 * Spawns the CLI, feeds it the message (stdin) and forwards its answer to the chat line by line —
 * the SSE contract is line-oriented. Claude keeps the conversation via --resume (the init event
 * hands us its session id, mapped to the chat's); gemini is stateless for now. The process runs in
 * a throwaway temp dir so the assistant never sees the server's working directory.
 */
@Service
public class CliAgentService {

  private static final org.slf4j.Logger log =
      org.slf4j.LoggerFactory.getLogger(CliAgentService.class);

  /** claude | gemini | auto (first one found on the PATH, claude preferred). */
  @Value("${mateu.agent.cli.command:auto}")
  String command;

  @Value("${mateu.agent.cli.timeout-seconds:180}")
  long timeoutSeconds;

  /** chat session id → CLI session id (claude --resume). */
  private final Map<String, String> cliSessions = new ConcurrentHashMap<>();

  public void run(CliAgentController.ChatRequest request, SseEmitter emitter) {
    Process process = null;
    try {
      var provider = resolveProvider();
      if (provider == null) {
        sendEvent(
            emitter,
            "{\"event\":\"agent-error\",\"detail\":{\"message\":"
                + "\"No hay ningún CLI de LLM en el PATH (claude, gemini). Instala uno o configura un agente por API.\"}}");
        emitter.complete();
        return;
      }
      var menuContext = Optional.ofNullable(request.menuContext()).map(CliAgentService::toJson);
      process = start(provider, request, menuContext);
      try (var stdin = process.getOutputStream()) {
        stdin.write(request.message().getBytes(StandardCharsets.UTF_8));
      }
      forward(provider, process, request.sessionId(), emitter);
      if (!process.waitFor(timeoutSeconds, TimeUnit.SECONDS)) {
        process.destroyForcibly();
        sendEvent(
            emitter,
            "{\"event\":\"agent-error\",\"detail\":{\"message\":\"El agente tardó demasiado y fue detenido.\"}}");
      }
      emitter.complete();
    } catch (Exception e) {
      log.warn("agent-cli falló: {}", e.getMessage());
      if (process != null) process.destroyForcibly();
      try {
        sendEvent(
            emitter,
            "{\"event\":\"agent-error\",\"detail\":{\"message\":\"" + e.getMessage() + "\"}}");
      } catch (Exception ignored) {
        // the client is gone
      }
      emitter.complete();
    }
  }

  private static String toJson(Object value) {
    try {
      return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(value);
    } catch (Exception e) {
      return String.valueOf(value);
    }
  }

  enum Provider {
    CLAUDE,
    GEMINI
  }

  private Provider resolveProvider() {
    if ("claude".equalsIgnoreCase(command)) return onPath("claude") ? Provider.CLAUDE : null;
    if ("gemini".equalsIgnoreCase(command)) return onPath("gemini") ? Provider.GEMINI : null;
    if (onPath("claude")) return Provider.CLAUDE;
    if (onPath("gemini")) return Provider.GEMINI;
    return null;
  }

  private boolean onPath(String binary) {
    var path = System.getenv("PATH");
    if (path == null) return false;
    for (var dir : path.split(java.io.File.pathSeparator)) {
      if (Files.isExecutable(java.nio.file.Path.of(dir, binary))) return true;
    }
    return false;
  }

  private Process start(
      Provider provider, CliAgentController.ChatRequest request, Optional<String> menuContext)
      throws IOException {
    var args = new ArrayList<String>();
    if (provider == Provider.CLAUDE) {
      args.addAll(
          List.of(
              "claude",
              "-p",
              "--output-format",
              "stream-json",
              "--include-partial-messages",
              "--verbose",
              "--append-system-prompt",
              CliAgentBridge.systemPreamble(menuContext)));
      var resumed = request.sessionId() == null ? null : cliSessions.get(request.sessionId());
      if (resumed != null) {
        args.add("--resume");
        args.add(resumed);
      }
    } else {
      args.add("gemini");
      args.add("-p");
      // gemini has no system-prompt flag: the preamble rides ahead of the message
      args.add(CliAgentBridge.systemPreamble(menuContext) + "\n\n---\n\n" + request.message());
    }
    var builder =
        new ProcessBuilder(args)
            .directory(Files.createTempDirectory("mateu-agent-").toFile())
            .redirectErrorStream(false);
    return builder.start();
  }

  private void forward(Provider provider, Process process, String chatSessionId, SseEmitter emitter)
      throws IOException {
    try (var reader =
        new BufferedReader(
            new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
      var pending = new StringBuilder(); // text buffered until a full LINE exists
      var sent = 0;
      String line;
      while ((line = reader.readLine()) != null) {
        String text = null;
        if (provider == Provider.CLAUDE) {
          var contribution = CliAgentBridge.parseClaudeLine(line, sent);
          if (contribution.sessionId() != null && chatSessionId != null) {
            cliSessions.put(chatSessionId, contribution.sessionId());
          }
          if (contribution.usageJson() != null) sendEvent(emitter, contribution.usageJson());
          text = contribution.text();
        } else {
          text = line + "\n"; // gemini streams plain text lines
        }
        if (text == null || text.isEmpty()) continue;
        sent += text.length();
        pending.append(text);
        int nl;
        while ((nl = pending.indexOf("\n")) >= 0) {
          sendEvent(emitter, pending.substring(0, nl));
          pending.delete(0, nl + 1);
        }
      }
      if (pending.length() > 0) sendEvent(emitter, pending.toString());
    }
  }

  private void sendEvent(SseEmitter emitter, String payload) throws IOException {
    emitter.send(SseEmitter.event().data(payload));
  }
}
