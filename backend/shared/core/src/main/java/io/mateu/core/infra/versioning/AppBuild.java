package io.mateu.core.infra.versioning;

import io.mateu.core.application.runaction.SpecsIndex;
import io.mateu.core.infra.MateuSettings;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HexFormat;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;

/**
 * The fingerprint of the UI this process serves, sent as the {@value #HEADER} response header of
 * every Mateu endpoint so a renderer can tell that the app was deployed again while a screen was
 * open — and tell a screen that went stale apart from a real permission refusal.
 *
 * <p>It hashes what decides what a screen is: the Mateu version, the bytecode of every type the
 * application exposes on the wire (the routed classes and what they reach — the same set {@code
 * WireTypePolicy} accepts) and the {@code specs/ui} files. So it is identical on every replica of
 * one release and changes when a screen changes, and only then: a fix in a service class does not
 * ask users to reload. {@value #SETTING} replaces it with a value of your own (a CI build number).
 *
 * <p>Computed once, on first use; development mode drops it with the specs.
 */
@Slf4j
public final class AppBuild {

  /** The response header carrying the build id. */
  public static final String HEADER = "X-Mateu-Build";

  /** Setting that replaces the computed id ({@code -Dmateu.build-id}, {@code MATEU_BUILD_ID}). */
  public static final String SETTING = "mateu.build-id";

  private static final int MAX_LENGTH = 64;

  private static volatile Supplier<Collection<String>> exposedTypes;
  private static volatile String computed;

  private AppBuild() {}

  /**
   * Registers where the exposed wire types come from (the wire type policy does it when it is
   * created). The most recent registration wins and drops the computed id.
   */
  public static void register(Supplier<Collection<String>> types) {
    exposedTypes = types;
    computed = null;
  }

  /** Drops the computed id: the next call computes it again (development mode, tests). */
  public static void invalidate() {
    computed = null;
  }

  /**
   * The build id, or null while it cannot be known yet (nothing registered the exposed types) — the
   * header is then left out rather than sending a value that would change on the next request.
   */
  public static String id() {
    var configured = sanitize(MateuSettings.get(SETTING));
    if (configured != null) {
      return configured;
    }
    var known = computed;
    if (known != null) {
      return known;
    }
    var types = exposedTypes;
    if (types == null) {
      return null;
    }
    try {
      known = compute(types.get(), classLoader());
    } catch (RuntimeException e) {
      log.debug("could not compute the build id: {}", e.toString());
      return null;
    }
    computed = known;
    ModuleVersions.checkOnce(classLoader());
    return known;
  }

  static String compute(Collection<String> typeNames, ClassLoader cl) {
    var digest = sha256();
    update(digest, "mateu " + String.valueOf(MateuVersion.current()));
    var names = new ArrayList<>(typeNames);
    names.sort(null);
    for (var name : names) {
      update(digest, name);
      try (InputStream in = cl.getResourceAsStream(name.replace('.', '/') + ".class")) {
        if (in != null) {
          digest.update(in.readAllBytes());
        }
      } catch (IOException e) {
        update(digest, "unreadable");
      }
    }
    var specs = SpecsIndex.of(cl);
    var paths = new ArrayList<>(specs.paths());
    paths.sort(null);
    for (var path : paths) {
      update(digest, path);
      try {
        update(digest, String.valueOf(specs.tree(path)));
      } catch (IOException e) {
        update(digest, "unparseable " + e.getMessage());
      }
    }
    return HexFormat.of().formatHex(digest.digest()).substring(0, 16);
  }

  /** The value of a configured id, reduced to the header's charset and length; null when blank. */
  static String sanitize(String value) {
    if (value == null) {
      return null;
    }
    var clean = value.trim().replaceAll("[^A-Za-z0-9._-]", "-");
    if (clean.isEmpty()) {
      return null;
    }
    return clean.length() > MAX_LENGTH ? clean.substring(0, MAX_LENGTH) : clean;
  }

  private static ClassLoader classLoader() {
    var cl = Thread.currentThread().getContextClassLoader();
    return cl != null ? cl : AppBuild.class.getClassLoader();
  }

  private static MessageDigest sha256() {
    try {
      return MessageDigest.getInstance("SHA-256");
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  private static void update(MessageDigest digest, String text) {
    digest.update(text.getBytes(StandardCharsets.UTF_8));
    digest.update((byte) 0);
  }
}
