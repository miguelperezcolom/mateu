package io.mateu.maven.bundle;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.MateuService;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import java.util.Collection;
import java.util.List;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * Boots the core bean graph headless (mirrors the core test harness {@code TestMateu}) so the
 * exporter can render routes at build time. The context uses the APP's classloader, so {@code
 * scan(basePackages)} discovers the app's
 * {@code @Service}/{@code @Component}/{@code @Configuration} beans and {@code
 * scan("io.mateu.core")} the framework (found via parent delegation). Each declared
 * {@code @UI}/{@code @Route} class is registered as a {@link RoutedClassProvider}, exactly as the
 * annotation processor's generated code does.
 *
 * <p>Fidelity boundary: this is a raw Spring context with no {@code Environment}, so
 * {@code @Value}/ {@code @ConfigurationProperties}/live-DB beans may fail to construct — a route
 * whose load needs them is skipped by the exporter, never fatal.
 */
final class BootContext implements AutoCloseable {

  private final AnnotationConfigApplicationContext ctx;
  final MateuService service;

  BootContext(ClassLoader appLoader, List<Class<?>> uiClasses, List<String> basePackages) {
    ctx = new AnnotationConfigApplicationContext();
    ctx.setClassLoader(appLoader);
    // @Primary so it wins over any BeanProvider the app's adapter contributes via component scan
    // (e.g. the mvc adapter's SpringBeanProvider), mirroring TestMateu's primary registration.
    ctx.registerBean(
        BeanProvider.class, () -> new ContextBeanProvider(ctx), bd -> bd.setPrimary(true));
    ctx.registerBean(ObjectMapper.class, () -> new ObjectMapper().findAndRegisterModules());
    int i = 0;
    for (Class<?> ui : uiClasses) {
      final Class<?> c = ui;
      ctx.registerBean(
          "rcp_" + (i++) + "_" + ui.getSimpleName(), RoutedClassProvider.class, () -> () -> c);
    }
    ctx.scan("io.mateu.core");
    if (basePackages != null) {
      for (String pkg : basePackages) {
        if (pkg != null && !pkg.isBlank()) {
          ctx.scan(pkg.trim());
        }
      }
    }
    ctx.refresh();
    MateuBeanProvider.setBeanProvider(ctx.getBean(BeanProvider.class));
    service = ctx.getBean(MateuService.class);
  }

  @Override
  public void close() {
    ctx.close();
  }

  private record ContextBeanProvider(ApplicationContext ctx) implements BeanProvider {
    @Override
    public <T> T getBean(Class<T> clazz) {
      try {
        return ctx.getBean(clazz);
      } catch (Exception e) {
        return null;
      }
    }

    @Override
    public <T> Collection<T> getBeans(Class<T> clazz) {
      try {
        return ctx.getBeansOfType(clazz).values();
      } catch (Exception e) {
        return List.of();
      }
    }
  }
}
