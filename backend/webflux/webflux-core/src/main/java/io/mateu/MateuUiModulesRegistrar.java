package io.mateu;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.boot.context.properties.bind.Bindable;
import org.springframework.boot.context.properties.bind.Binder;
import org.springframework.context.EnvironmentAware;
import org.springframework.context.ResourceLoaderAware;
import org.springframework.context.annotation.ClassPathBeanDefinitionScanner;
import org.springframework.context.annotation.ImportBeanDefinitionRegistrar;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ResourceLoader;
import org.springframework.core.type.AnnotationMetadata;
import org.springframework.util.ClassUtils;

/**
 * Registers the beans of the third-party Mateu UI modules an application asked for — by {@link
 * EnableMateuUiModules} on one of its configuration classes, or by the {@value #PROPERTY} property
 * (read when {@link MateuAutoConfiguration} imports this registrar).
 *
 * <p>An {@link ImportBeanDefinitionRegistrar}, not a post-processor: what it registers is seen by
 * the configuration-class pass that follows, so a module's own {@code @Configuration} classes get
 * their {@code @Bean} methods processed exactly as if the application had scanned the package.
 */
@Slf4j
public class MateuUiModulesRegistrar
    implements ImportBeanDefinitionRegistrar, EnvironmentAware, ResourceLoaderAware {

  /** The property naming the packages of the UI modules to mount (comma-separated or a list). */
  public static final String PROPERTY = "mateu.ui.modules";

  private Environment environment;
  private ResourceLoader resourceLoader;

  @Override
  public void setEnvironment(Environment environment) {
    this.environment = environment;
  }

  @Override
  public void setResourceLoader(ResourceLoader resourceLoader) {
    this.resourceLoader = resourceLoader;
  }

  @Override
  public void registerBeanDefinitions(
      AnnotationMetadata importingClassMetadata, BeanDefinitionRegistry registry) {
    var packages = new LinkedHashSet<String>();
    String source;
    if (MateuAutoConfiguration.class.getName().equals(importingClassMetadata.getClassName())) {
      packages.addAll(fromProperty(environment));
      source = PROPERTY;
    } else {
      packages.addAll(fromAnnotation(importingClassMetadata));
      source = "@EnableMateuUiModules on " + importingClassMetadata.getClassName();
    }
    if (packages.isEmpty()) {
      return;
    }
    scan(registry, packages, source);
  }

  private void scan(BeanDefinitionRegistry registry, Set<String> packages, String source) {
    var scanner = new ClassPathBeanDefinitionScanner(registry, true, environment, resourceLoader);
    for (String pkg : packages) {
      int found = scanner.scan(pkg);
      if (found == 0) {
        log.warn(
            "Mateu UI module '{}' ({}): no beans found in that package. Check the name — it must be"
                + " the package of the module's @UI classes (where its generated controllers"
                + " live) — and that the module's jar is on the classpath.",
            pkg,
            source);
      } else {
        log.info("Mateu UI module '{}' ({}): {} beans registered", pkg, source, found);
      }
    }
  }

  /** The packages named by {@value #PROPERTY} ({@code MATEU_UI_MODULES}), blanks dropped. */
  static List<String> fromProperty(Environment environment) {
    if (environment == null) {
      return List.of();
    }
    var out = new ArrayList<String>();
    Binder.get(environment)
        .bind(PROPERTY, Bindable.listOf(String.class))
        .ifBound(
            values -> {
              for (String v : values) {
                for (String p : v.split(",")) {
                  if (!p.isBlank()) out.add(p.trim());
                }
              }
            });
    return out;
  }

  static List<String> fromAnnotation(AnnotationMetadata metadata) {
    Map<String, Object> attributes =
        metadata.getAnnotationAttributes(EnableMateuUiModules.class.getName());
    if (attributes == null) {
      return List.of();
    }
    var out = new ArrayList<String>();
    out.addAll(Arrays.asList((String[]) attributes.get("value")));
    out.addAll(Arrays.asList((String[]) attributes.get("basePackages")));
    for (Class<?> c : (Class<?>[]) attributes.get("basePackageClasses")) {
      out.add(ClassUtils.getPackageName(c));
    }
    out.removeIf(String::isBlank);
    return out;
  }
}
