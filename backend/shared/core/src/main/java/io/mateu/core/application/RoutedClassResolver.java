package io.mateu.core.application;

import io.mateu.core.application.runaction.RunActionCommand;
import java.util.Optional;

public interface RoutedClassResolver {

  Optional<ResolvedRoute> resolveAbsolute(String route, RunActionCommand command);

  Optional<ResolvedRoute> resolveApp(String route, RunActionCommand command);

  Optional<ResolvedRoute> resolve(String route, RunActionCommand command);
}
