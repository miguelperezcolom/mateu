package io.mateu.core.application;

import io.mateu.core.application.runaction.RunActionCommand;
import java.util.Optional;

public interface RoutedClassResolver {

  Optional<ResolvedRoute> resolveAbsolute(String route, RunActionCommand command);

  Optional<ResolvedRoute> resolveApp(String route, RunActionCommand command);

  Optional<ResolvedRoute> resolve(String route, RunActionCommand command);

  /**
   * Whether routes.yaml authors this exact route WITHOUT a view model — a definition-only page.
   * Such a route has no class by design, so a shorter prefix's class (the root {@code @UI("")}
   * view) must not answer for it: the definition does.
   */
  default boolean authoredWithoutClass(String route) {
    return false;
  }
}
