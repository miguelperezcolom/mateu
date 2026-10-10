package io.mateu;

import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

/**
 * Registers Mateu's own beans — and ONLY Mateu's own. The scan covers the adapter's classes in the
 * {@code io.mateu} package itself and Mateu's modules ({@code io.mateu.core}, {@code
 * io.mateu.export}, {@code io.mateu.agent.cli}); any other {@code io.mateu.*} package is left out,
 * because a third-party library may live under {@code io.mateu} too (a workflow engine with its own
 * management UI, say) and sweeping its beans into the application is not Mateu's call.
 *
 * <p>Mateu's optional pieces under other sub-packages ({@code io.mateu.mcp}, {@code io.mateu.dev},
 * {@code io.mateu.yamlmount}) are auto-configurations of their own, registered with their
 * conditions by {@code META-INF/spring/…AutoConfiguration.imports}.
 *
 * <p>So an application needs no {@code scanBasePackages = "io.mateu"}: its own packages are enough.
 */
@AutoConfiguration
@ComponentScan(
    basePackages = "io.mateu",
    excludeFilters =
        @ComponentScan.Filter(type = FilterType.REGEX, pattern = MateuAutoConfiguration.NOT_OURS))
public class MateuAutoConfiguration {

  /** Any class in a sub-package of {@code io.mateu} that is not one of Mateu's. */
  static final String NOT_OURS = "io\\.mateu\\.(?!core\\.|export\\.|agent\\.cli\\.)[^.]+\\..+";
}
