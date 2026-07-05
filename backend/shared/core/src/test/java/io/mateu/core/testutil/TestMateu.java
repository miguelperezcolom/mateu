package io.mateu.core.testutil;

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
import reactor.core.publisher.Flux;

/**
 * In-JVM Mateu backend for integration tests: boots the whole core bean graph (Spring understands
 * the jakarta.inject annotations the framework uses), registers the given fixture classes exactly
 * like the annotation processor's generated {@code RoutedClassProvider}s would, and exposes the
 * same entry point the generated controllers call. A single {@link #sync(String)} therefore
 * exercises route resolution, instance creation, reflective mapping, and DTO serialization — the
 * full server side of a {@code /mateu/v3/sync} request.
 */
public final class TestMateu implements AutoCloseable {

  private final AnnotationConfigApplicationContext ctx;
  private final MateuService service;

  private TestMateu(AnnotationConfigApplicationContext ctx) {
    this.ctx = ctx;
    this.service = ctx.getBean(MateuService.class);
  }

  /** Boot a backend whose registered routes are the given @UI/@Route fixture classes. */
  public static TestMateu withUis(Class<?>... uiClasses) {
    return withUisAndBeans(List.of(), uiClasses);
  }

  /**
   * Same, additionally registering platform beans an adapter would normally contribute (e.g. an
   * ExcelExporter for the export actions). Each bean is registered under its concrete class.
   */
  public static TestMateu withUisAndBeans(List<Object> extraBeans, Class<?>... uiClasses) {
    var ctx = new AnnotationConfigApplicationContext();
    for (Object bean : extraBeans) {
      @SuppressWarnings("unchecked")
      var type = (Class<Object>) bean.getClass();
      // primary, so a fake can override a scanned default implementing the same port
      ctx.registerBean(type, () -> bean, bd -> bd.setPrimary(true));
    }
    ctx.registerBean(BeanProvider.class, () -> new ContextBeanProvider(ctx));
    // The adapters normally contribute these platform beans.
    ctx.registerBean(
        com.fasterxml.jackson.databind.ObjectMapper.class,
        () -> new com.fasterxml.jackson.databind.ObjectMapper().findAndRegisterModules());
    int i = 0;
    for (Class<?> uiClass : uiClasses) {
      var name = "routedClassProvider_" + (i++) + "_" + uiClass.getSimpleName();
      ctx.registerBean(name, RoutedClassProvider.class, () -> () -> uiClass);
    }
    ctx.scan("io.mateu.core");
    ctx.refresh();
    // Framework internals resolve beans through this static holder (MateuBeanProvider.get()).
    MateuBeanProvider.setBeanProvider(ctx.getBean(BeanProvider.class));
    return new TestMateu(ctx);
  }

  /** Initial page load for a route — what the browser does when navigating to it. */
  public UIIncrementDto sync(String route) {
    return run(RunActionRqDto.builder().route(route).actionId("").build());
  }

  /** Full-control variant: run any action with component state, serverSideType, etc. */
  public UIIncrementDto run(RunActionRqDto rq) {
    try {
      // Adapters set the "baseUrl" request attribute; internal wraps (e.g. the crud mediator)
      // read it and NPE without it.
      var httpRequest = new FakeHttpRequest(rq).withAttribute("baseUrl", "");
      Flux<UIIncrementDto> flux = service.runAction("", rq, "", httpRequest);
      var result = flux.blockFirst();
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

  /** All increments (some flows emit several, e.g. remote menus). */
  public List<UIIncrementDto> runAll(RunActionRqDto rq) {
    try {
      var httpRequest = new FakeHttpRequest(rq).withAttribute("baseUrl", "");
      return service.runAction("", rq, "", httpRequest).collectList().block();
    } catch (RuntimeException | Error e) {
      throw e;
    } catch (Throwable t) {
      throw new AssertionError("runAction failed for " + rq, t);
    }
  }

  public ApplicationContext context() {
    return ctx;
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
