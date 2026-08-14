package io.mateu.yamlmount;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;

/**
 * True when the classpath carries a {@code specs/ui/routes.yaml} with an {@code app:} block — i.e.
 * this deployment IS a data-authored mount. Gates {@link YamlMountAutoConfiguration} so the default
 * controllers are contributed only when there is a YAML app to serve, never for an arbitrary app
 * that merely depends on {@code mvc-core}.
 */
public class YamlMountCondition implements Condition {

  static final String ROUTES_YAML = "specs/ui/routes.yaml";

  @Override
  public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
    var classLoader = context.getClassLoader();
    if (classLoader == null) {
      classLoader = getClass().getClassLoader();
    }
    try (var is = classLoader.getResourceAsStream(ROUTES_YAML)) {
      if (is == null) {
        return false;
      }
      var root = new ObjectMapper(new YAMLFactory()).readTree(is);
      return root != null && root.hasNonNull("app") && root.get("app").isObject();
    } catch (Exception e) {
      return false;
    }
  }
}
