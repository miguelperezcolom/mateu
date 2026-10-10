package io.mateu.springdata.testutil;

import io.mateu.core.application.MateuService;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.interfaces.RoutedClassProvider;
import java.util.Collection;
import java.util.List;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

/**
 * The core module's {@code TestMateu}, trimmed: boots the whole Mateu core bean graph in-JVM,
 * registers the given {@code @UI} classes like the annotation processor would, and runs actions
 * through the same {@link MateuService} entry point the generated controllers call.
 */
public final class MiniMateu implements AutoCloseable {

  private final AnnotationConfigApplicationContext ctx;
  private final MateuService service;

  private MiniMateu(AnnotationConfigApplicationContext ctx) {
    this.ctx = ctx;
    this.service = ctx.getBean(MateuService.class);
  }

  public static MiniMateu withUis(Class<?>... uiClasses) {
    var ctx = new AnnotationConfigApplicationContext();
    ctx.registerBean(BeanProvider.class, () -> new ContextBeanProvider(ctx));
    ctx.registerBean(
        com.fasterxml.jackson.databind.ObjectMapper.class,
        () -> new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules());
    int i = 0;
    for (Class<?> uiClass : uiClasses) {
      ctx.registerBean(
          "routedClassProvider_" + (i++), RoutedClassProvider.class, () -> () -> uiClass);
    }
    ctx.scan("io.mateu.core");
    ctx.refresh();
    MateuBeanProvider.setBeanProvider(ctx.getBean(BeanProvider.class));
    return new MiniMateu(ctx);
  }

  public UIIncrementDto run(RunActionRqDto rq) {
    try {
      var httpRequest = new FakeHttpRequest(rq).withAttribute("baseUrl", "");
      var result = service.runAction("", rq, "", httpRequest).blockFirst();
      if (result == null) {
        throw new AssertionError("runAction produced no increment for " + rq);
      }
      return result;
    } catch (RuntimeException | Error e) {
      throw e;
    } catch (Throwable t) {
      throw new AssertionError("runAction failed for " + rq, t);
    }
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
