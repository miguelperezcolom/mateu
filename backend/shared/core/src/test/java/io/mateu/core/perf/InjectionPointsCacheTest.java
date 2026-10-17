package io.mateu.core.perf;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import jakarta.inject.Inject;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The injection points of a view model are found once per class, and still filled per instance
 * exactly as before: inherited fields too, a field already holding a value is left alone, a field
 * with no bean stays null, and an unannotated field of a bean type is never touched.
 */
class InjectionPointsCacheTest {

  public static class Service {}

  public static class Other {}

  public static class Base {
    @Inject Service inherited;
  }

  public static class Model extends Base {
    @Inject Service own;
    @Inject Other missing;
    @Inject Service preset = PRESET;
    Service notAnInjectionPoint;
    static Service STATIC_ONE;
  }

  static final Service PRESET = new Service();

  /** A container holding one {@link Service}, counting how often its bean was asked for. */
  static final class Container implements BeanProvider {
    final Service service = new Service();
    int serviceLookups;

    @Override
    @SuppressWarnings("unchecked")
    public <T> T getBean(Class<T> clazz) {
      if (clazz == Service.class) {
        serviceLookups++;
        return (T) service;
      }
      return null;
    }

    @Override
    public <T> Collection<T> getBeans(Class<T> clazz) {
      return List.of();
    }
  }

  static FakeHttpRequest request() {
    return new FakeHttpRequest(RunActionRqDto.builder().route("/x").actionId("").build());
  }

  @Test
  void injectionPointsAreFoundOncePerClassAndFilledPerInstance() {
    var container = new Container();
    var factory = new ReflectionInstanceFactory(container);

    Model first = factory.newInstance(Model.class, Map.of(), request());
    long scansAfterFirst = ReflectionInstanceFactory.injectionFieldScans();
    Model second = factory.newInstance(Model.class, Map.of(), request());

    for (var model : List.of(first, second)) {
      assertThat(model.inherited).isSameAs(container.service);
      assertThat(model.own).isSameAs(container.service);
      assertThat(model.preset).isSameAs(PRESET);
      assertThat(model.missing).isNull();
      assertThat(model.notAnInjectionPoint).isNull();
    }
    assertThat(Model.STATIC_ONE).isNull();
    assertThat(first).isNotSameAs(second);
    // the second instance walked no class: the injection points were remembered
    assertThat(ReflectionInstanceFactory.injectionFieldScans()).isEqualTo(scansAfterFirst);
    // but the bean is still asked for per instance and per field (its scope is the app's)
    assertThat(container.serviceLookups).isEqualTo(4);
  }
}
