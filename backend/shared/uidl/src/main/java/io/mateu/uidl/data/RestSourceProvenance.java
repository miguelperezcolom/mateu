package io.mateu.uidl.data;

/**
 * Whether the endpoint a {@link RestSourceEntry} names is one somebody ALREADY serves or one this
 * project still has to build. It is the switch that decides what the derived artifacts do with it:
 * an {@link #existing} source is documented and can be verified against its owner's published
 * OpenAPI, while a {@link #generate} source is what the server skeleton is generated from.
 *
 * <p>Without the distinction the derivation would be nonsense in both directions — generating a
 * Spring controller for a third party's public API, or quietly omitting the endpoints the project
 * itself owes.
 */
public enum RestSourceProvenance {

  /**
   * Infer it from the URL (the default): a relative / same-origin URL means somebody here has to
   * serve it, so {@link #generate}; a URL naming another origin is somebody else's, so {@link
   * #existing}. Declare one of the other two when you disagree.
   */
  auto,

  /** The endpoint does not exist yet: derive its contract AND generate a server for it. */
  generate,

  /** The endpoint already exists: document it, verify against it, never generate it. */
  existing;

  /**
   * The effective provenance of a source, never {@code auto}.
   *
   * <p>A declared value always wins; {@code auto} reads the URL. The inference is deliberately
   * crude — an origin is either ours or it is not — because the cases it gets wrong are exactly the
   * ones worth declaring explicitly.
   */
  public static RestSourceProvenance resolve(RestSourceProvenance declared, String url) {
    if (declared != null && declared != auto) {
      return declared;
    }
    return isAbsolute(url) ? existing : generate;
  }

  /**
   * True when the URL names its own origin. Interpolation placeholders make a URL unparseable as a
   * URI, so this reads the scheme off the front rather than parsing.
   */
  private static boolean isAbsolute(String url) {
    if (url == null) {
      return false;
    }
    var trimmed = url.trim();
    if (trimmed.startsWith("//")) {
      return true;
    }
    return trimmed.matches("^[a-zA-Z][a-zA-Z0-9+.\\-]*://.*");
  }
}
