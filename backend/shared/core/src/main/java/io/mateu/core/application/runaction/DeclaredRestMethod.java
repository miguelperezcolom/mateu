package io.mateu.core.application.runaction;

/**
 * The HTTP method a {@code @Rest*} annotation really declares.
 *
 * @deprecated moved to the domain side: use {@link io.mateu.core.domain.DeclaredRestMethod}
 */
@Deprecated(since = "3.0-alpha.425", forRemoval = true)
public final class DeclaredRestMethod {

  /**
   * @deprecated use {@link io.mateu.core.domain.DeclaredRestMethod#of(String, String, String)}
   */
  @Deprecated(since = "3.0-alpha.425", forRemoval = true)
  public static String of(String source, String method, String annotationDefault) {
    return io.mateu.core.domain.DeclaredRestMethod.of(source, method, annotationDefault);
  }

  private DeclaredRestMethod() {}
}
