package io.mateu.core.application.runaction;

/**
 * The HTTP method a {@code @Rest*} annotation really declares.
 *
 * <p>An annotation attribute cannot be "unset": {@code @RestAction.method()} is {@code "POST"} and
 * {@code @RestListing/@RestData/@RestOptions.method()} {@code "GET"} whether the author wrote it or
 * not. For an inline {@code url} that default is the method. For a {@code source} reference it is
 * not: the catalogue entry knows its endpoint's method, and the surface's value WINS over the
 * entry's — so a by-ref {@code @RestAction(source = "x-delete")} used to call a {@code DELETE}
 * endpoint with {@code POST}. By reference, the default means "the entry's" (blank), exactly as
 * {@code @RestOptions} already treats its default {@code valuePath}.
 */
public final class DeclaredRestMethod {

  public static String of(String source, String method, String annotationDefault) {
    boolean byRef = source != null && !source.isBlank();
    return byRef && method != null && method.equalsIgnoreCase(annotationDefault) ? "" : method;
  }

  private DeclaredRestMethod() {}
}
