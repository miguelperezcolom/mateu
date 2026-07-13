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

  /**
   * MCP servers for the CLI (claude only): inline JSON or a file path, passed as --mcp-config with
   * --strict-mcp-config so ONLY these servers load. The host app points this at its own MCP
   * endpoint and the chat's agent can act.
   */
  @Value("${mateu.agent.cli.mcp-config:}")
  String mcpConfig;

  /** Tools the CLI may use without prompting (claude --allowedTools), e.g. mcp__modux. */
  @Value("${mateu.agent.cli.allowed-tools:}")
  String allowedTools;

  /** Origins (besides localhost) whose app-advertised mcpUrl the agent will accept. */
  @Value("${mateu.agent.cli.allowed-mcp-origins:}")
  String allowedMcpOrigins;

  /** The companion's CORS allowlist doubles as consent for that origin's mcpUrl. */
  @Value("${mateu.agent.companion.allow-origins:}")
  String companionAllowOrigins;

  /** chat session id → CLI session id (claude --resume). */
  private final Map<String, String> cliSessions = new ConcurrentHashMap<>();

  /**
   * Where the chat's attached files landed; exposed to the CLI via a per-session filesystem MCP.
   */
  private final AgentUploadStore uploads;

  public CliAgentService(AgentUploadStore uploads) {
    this.uploads = uploads;
  }

  public void run(
      CliAgentController.ChatRequest request, String authorization, SseEmitter emitter) {
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
      process = start(provider, request, authorization, menuContext);
      try (var stdin = process.getOutputStream()) {
        stdin.write(withScreenContext(request).getBytes(StandardCharsets.UTF_8));
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

  /**
   * The screen rides ahead of every message: what the user is LOOKING AT (route, app/component
   * state) so the assistant acts in place instead of navigating blindly. Truncated — state objects
   * can be arbitrarily big.
   */
  private static String withScreenContext(CliAgentController.ChatRequest request) {
    var attachmentsHeader = attachmentsHeader(request);
    if (request.context() == null) return attachmentsHeader + request.message();
    var json = toJson(request.context());
    if (json.length() > 6000) json = json.substring(0, 6000) + "…";
    return "### Contexto de pantalla (automático)\n"
        + json
        + "\n\n"
        + attachmentsHeader
        + "### Mensaje del usuario\n"
        + request.message();
  }

  /** Tells the model which files the user attached and that they're readable via the files MCP. */
  private static String attachmentsHeader(CliAgentController.ChatRequest request) {
    var attachments = request.attachments();
    if (attachments == null || attachments.isEmpty()) return "";
    var names =
        attachments.stream()
            .map(CliAgentController.ChatRequest.Attachment::name)
            .filter(n -> n != null && !n.isBlank())
            .toList();
    if (names.isEmpty()) return "";
    return "### Ficheros adjuntos\n"
        + "El usuario ha adjuntado: "
        + String.join(", ", names)
        + ". Están disponibles a través del servidor MCP \"files\" (léelos con sus herramientas"
        + " mcp__files por su nombre) antes de responder.\n\n";
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

  /**
   * The MCP the CLI gets: the statically configured one wins; otherwise the one the APP advertised
   * with the message (mcpUrl), accepted only when its origin is allowed (the same consent that lets
   * the app use this agent) and carrying the user's own Authorization so the remote MCP sees THEM.
   */
  private String resolveMcpConfig(CliAgentController.ChatRequest request, String authorization) {
    if (!mcpConfig.isBlank()) return mcpConfig;
    var url = request.mcpUrl();
    if (url == null || url.isBlank()) return "";
    if (!mcpOriginAllowed(url)) {
      log.warn("mcpUrl {} rechazada: su origen no está permitido", url);
      return "";
    }
    var headers =
        authorization == null || authorization.isBlank()
            ? ""
            : ",\"headers\":{\"Authorization\":" + quote(authorization) + "}";
    return "{\"mcpServers\":{\"app\":{\"type\":\"http\",\"url\":" + quote(url) + headers + "}}}";
  }

  private boolean mcpOriginAllowed(String url) {
    try {
      var uri = java.net.URI.create(url);
      var host = uri.getHost();
      if ("127.0.0.1".equals(host) || "localhost".equals(host)) return true;
      var target = uri.getScheme() + "://" + uri.getAuthority();
      for (var candidate : (allowedMcpOrigins + "," + companionAllowOrigins).split(",")) {
        if (!candidate.isBlank() && candidate.trim().equals(target)) return true;
      }
      return false;
    } catch (Exception e) {
      return false;
    }
  }

  private static String quote(String value) {
    return "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
  }

  /**
   * A stdio filesystem MCP server rooted at the session's upload dir, or "" when it has no files.
   */
  private String filesMcpConfig(String sessionId) {
    if (sessionId == null || !uploads.hasFiles(sessionId)) return "";
    var root = uploads.sessionDir(sessionId).toAbsolutePath().toString();
    return "{\"mcpServers\":{\"files\":{\"command\":\"npx\",\"args\":[\"-y\","
        + "\"@modelcontextprotocol/server-filesystem\","
        + quote(root)
        + "]}}}";
  }

  /**
   * claude --allowedTools list: the app server's tools (if any) plus the files server's (if any).
   */
  private String computeAllowedTools(boolean appMcp, boolean filesMcp) {
    var tools = new ArrayList<String>();
    if (appMcp) tools.add(allowedTools.isBlank() ? "mcp__app" : allowedTools);
    if (filesMcp) tools.add("mcp__files");
    return String.join(",", tools);
  }

  private Process start(
      Provider provider,
      CliAgentController.ChatRequest request,
      String authorization,
      Optional<String> menuContext)
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
      var effectiveMcp = resolveMcpConfig(request, authorization);
      // Attached files ride in through a per-session filesystem MCP so the model can read them (the
      // CLI runs in a throwaway dir, so this is its only window onto the uploads). claude accepts
      // several --mcp-config flags and merges them, so we don't have to splice JSON.
      var filesMcp = filesMcpConfig(request.sessionId());
      if (!effectiveMcp.isBlank() || !filesMcp.isBlank()) {
        if (!effectiveMcp.isBlank()) {
          args.add("--mcp-config");
          args.add(effectiveMcp);
        }
        if (!filesMcp.isBlank()) {
          args.add("--mcp-config");
          args.add(filesMcp);
        }
        args.add("--strict-mcp-config");
        args.add("--allowedTools");
        args.add(computeAllowedTools(!effectiveMcp.isBlank(), !filesMcp.isBlank()));
      }
      var resumed = request.sessionId() == null ? null : cliSessions.get(request.sessionId());
      if (resumed != null) {
        args.add("--resume");
        args.add(resumed);
      }
    } else {
      args.add("gemini");
      args.add("-p");
      // gemini has no system-prompt flag: the preamble rides ahead of the message
      args.add(
          CliAgentBridge.systemPreamble(menuContext) + "\n\n---\n\n" + withScreenContext(request));
    }
    var builder =
        new ProcessBuilder(args)
            .directory(workingDir(request.sessionId()).toFile())
            .redirectErrorStream(false);
    return builder.start();
  }

  /**
   * The CLI's working directory. When the session has attached files we run IN their upload dir:
   * the filesystem MCP scopes to the client's working directory (the roots claude advertises), not
   * to its CLI argument, so this is what actually makes the uploads visible to the model. With no
   * files a throwaway temp dir keeps the assistant away from the server's working directory.
   */
  private java.nio.file.Path workingDir(String sessionId) throws IOException {
    if (sessionId != null && uploads.hasFiles(sessionId)) return uploads.sessionDir(sessionId);
    return Files.createTempDirectory("mateu-agent-");
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
