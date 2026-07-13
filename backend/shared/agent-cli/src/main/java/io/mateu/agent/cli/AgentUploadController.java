package io.mateu.agent.cli;

import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * The file-attachment endpoint the chat POSTs to (point {@code @AI(upload = "/mateu/agent/upload")}
 * here). It saves each file into the caller's per-session directory via {@link AgentUploadStore};
 * the CLI agent then reads them through a filesystem MCP rooted at that directory. Localhost-dev
 * only — an exposed server should upload behind real auth and storage.
 */
@RestController
public class AgentUploadController {

  private final AgentUploadStore store;

  public AgentUploadController(AgentUploadStore store) {
    this.store = store;
  }

  @PostMapping(value = "${mateu.agent.cli.upload-path:/mateu/agent/upload}")
  public ResponseEntity<?> upload(
      @RequestParam("files") List<MultipartFile> files,
      @RequestParam(value = "sessionId", required = false) String sessionId) {
    try {
      var saved = store.save(sessionId, files);
      return ResponseEntity.ok(Map.of("files", saved));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "No se pudieron guardar los ficheros: " + e.getMessage()));
    }
  }
}
