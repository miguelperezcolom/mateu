package io.mateu.agent.cli;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Saves files the chat attaches into a per-session directory under {@code
 * mateu.agent.cli.upload-dir} (default {@code $TMPDIR/mateu-agent-uploads}). The CLI agent then
 * reads them through a filesystem MCP server rooted at that session directory (see {@link
 * CliAgentService}). Localhost-dev only — an exposed server should store uploads behind real auth
 * and quota.
 */
@Component
public class AgentUploadStore {

  private final Path baseDir;
  private final long maxBytes;

  public AgentUploadStore(
      @Value("${mateu.agent.cli.upload-dir:}") String uploadDir,
      @Value("${mateu.agent.cli.max-upload-mb:25}") long maxUploadMb) {
    this.baseDir =
        (uploadDir == null || uploadDir.isBlank())
            ? Path.of(System.getProperty("java.io.tmpdir"), "mateu-agent-uploads")
            : Path.of(uploadDir);
    this.maxBytes = maxUploadMb * 1024 * 1024;
  }

  /**
   * One saved file: {@code name} is the on-disk (sanitized) filename; {@code path} is what the chat
   * echoes and what the model reads via the files MCP — relative to the session root, so it equals
   * the name.
   */
  public record Saved(String name, String path) {}

  /** The directory this session's files live in (the filesystem MCP's root for that session). */
  public Path sessionDir(String sessionId) {
    return baseDir.resolve(safeSession(sessionId));
  }

  /** True when the session already has at least one uploaded file. */
  public boolean hasFiles(String sessionId) {
    var dir = sessionDir(sessionId);
    if (!Files.isDirectory(dir)) return false;
    try (Stream<Path> s = Files.list(dir)) {
      return s.findAny().isPresent();
    } catch (IOException e) {
      return false;
    }
  }

  /** Saves the multipart files into the session directory, returning the stored entries. */
  public List<Saved> save(String sessionId, List<MultipartFile> files) throws IOException {
    var dir = sessionDir(sessionId);
    Files.createDirectories(dir);
    var saved = new ArrayList<Saved>();
    for (var file : files) {
      if (file == null || file.isEmpty()) continue;
      if (file.getSize() > maxBytes) {
        throw new IllegalArgumentException(
            "El fichero " + file.getOriginalFilename() + " supera el máximo permitido.");
      }
      var name = safeName(file.getOriginalFilename());
      var target = dir.resolve(name).normalize();
      // never escape the session directory (defence in depth on top of safeName)
      if (!target.startsWith(dir))
        throw new IllegalArgumentException("Nombre de fichero inválido.");
      file.transferTo(target);
      saved.add(new Saved(name, name));
    }
    return saved;
  }

  /**
   * Keeps a session id to a filesystem-safe token (it is a nanoid on the wire, but never trust it).
   */
  private static String safeSession(String sessionId) {
    if (sessionId == null || sessionId.isBlank()) return "default";
    var cleaned = sessionId.replaceAll("[^A-Za-z0-9_-]", "");
    return cleaned.isBlank() ? "default" : cleaned.substring(0, Math.min(cleaned.length(), 64));
  }

  /** Strips any path components and unsafe characters from an uploaded filename. */
  private static String safeName(String original) {
    var base = original == null ? "file" : original;
    // drop directories from either separator
    var slash = Math.max(base.lastIndexOf('/'), base.lastIndexOf('\\'));
    if (slash >= 0) base = base.substring(slash + 1);
    base = base.replaceAll("[^A-Za-z0-9._-]", "_").replaceAll("^\\.+", "_");
    if (base.isBlank()) base = "file";
    return base.substring(0, Math.min(base.length(), 120));
  }
}
