package io.mateu.yamlmount;

import io.mateu.core.application.runaction.MountRegistry;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * True when the classpath declares at least one data-driven mount — a {@code type: UI} file under
 * {@code specs/ui/**} (see {@link MountRegistry}). Gates {@link YamlMountAutoConfiguration} so the
 * default controllers are contributed only when there is a YAML UI to serve, never for an arbitrary
 * app that merely depends on {@code mvc-core}.
 */
public class YamlMountCondition implements Condition {

  @Override
  public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
    var classLoader = context.getClassLoader();
    if (classLoader == null) {
      classLoader = getClass().getClassLoader();
    }
    return !new MountRegistry().mounts(classLoader).isEmpty();
  }
}
