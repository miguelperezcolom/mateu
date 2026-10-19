package io.mateu.core.application.authoring;

import io.mateu.uidl.UserFacingException;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Pattern;

/**
 * Writes an authored definition into the specs directory — the {@code mateu_save_spec} tool, only
 * ever offered in development mode. The path rule is normative (the same in .NET, Python and the
 * sidecar): a relative {@code .yaml}/{@code .yml} path with no {@code ..}, {@code .} or empty
 * segment, no backslash, no drive letter, at most 255 characters, that stays inside the specs
 * directory once symbolic links are followed.
 */
public final class SpecWriter {

  private static final Pattern DRIVE = Pattern.compile("^[A-Za-z]:");

  private SpecWriter() {}

  /** Whether {@code path} is acceptable before touching the disk. */
  public static boolean isAcceptable(String path) {
    if (path == null || path.isBlank() || path.length() > 255) {
      return false;
    }
    if (path.indexOf('\0') >= 0
        || path.contains("\\")
        || path.startsWith("/")
        || DRIVE.matcher(path).find()) {
      return false;
    }
    if (!(path.endsWith(".yaml") || path.endsWith(".yml"))) {
      return false;
    }
    for (var segment : path.split("/", -1)) {
      if (segment.isEmpty() || segment.equals(".") || segment.equals("..")) {
        return false;
      }
    }
    return true;
  }

  /** The message of a refused path (shown as written). */
  public static String refusal(String path) {
    return "Invalid path "
        + UidlValidator.quote(path == null ? "" : path)
        + ": give a relative .yaml or .yml path inside the specs directory (no \"..\", no absolute"
        + " path).";
  }

  /**
   * Writes {@code yaml} at {@code path} under {@code root}, creating the folders it needs.
   *
   * @return the number of bytes written
   * @throws UserFacingException when the path is refused
   */
  public static int write(Path root, String path, String yaml) throws IOException {
    if (!isAcceptable(path)) {
      throw new UserFacingException(refusal(path));
    }
    var base = root.toAbsolutePath().normalize();
    var target = base.resolve(path).normalize();
    if (!target.startsWith(base)) {
      throw new UserFacingException(refusal(path));
    }
    var realBase = base.toRealPath();
    var existing = target.getParent();
    while (existing != null && !Files.exists(existing)) {
      existing = existing.getParent();
    }
    if (existing == null || !existing.toRealPath().startsWith(realBase)) {
      throw new UserFacingException(refusal(path));
    }
    if (Files.isSymbolicLink(target) && !target.toRealPath().startsWith(realBase)) {
      throw new UserFacingException(refusal(path));
    }
    Files.createDirectories(target.getParent());
    var bytes = yaml.getBytes(StandardCharsets.UTF_8);
    Files.write(target, bytes);
    return bytes.length;
  }
}
