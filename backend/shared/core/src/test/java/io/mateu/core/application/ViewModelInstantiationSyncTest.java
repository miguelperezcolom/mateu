package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.infra.reflection.ReflectionInstanceFactory;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * How a view model instance comes to exist for a request: a view registered as a container bean is
 * still hydrated from the request's state (the prototype-bean pattern), and a non-static inner
 * class is built inside a fresh instance of its enclosing class.
 */
class ViewModelInstantiationSyncTest {

  @UI("/bean-view")
  @Title("Bean view")
  public static class BeanView {
    public String name = "initial";
  }

  public static class Outer {
    public String tag = "outer";

    public class Inner {
      public String value;

      public String outerTag() {
        return tag;
      }
    }
  }

  static TestMateu mateu;
  static final ObjectMapper JSON = new ObjectMapper();

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new BeanView()), BeanView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String load(Class<?> type, String route, Map<String, Object> state) {
    return run(type, route, "", state);
  }

  private static String run(
      Class<?> type, String route, String actionId, Map<String, Object> state) {
    return JSON.valueToTree(
            mateu.run(
                RunActionRqDto.builder()
                    .route(route)
                    .consumedRoute(route)
                    .serverSideType(type.getName())
                    .actionId(actionId)
                    .componentState(state)
                    .initiatorComponentId("v")
                    .build()))
        .toString();
  }

  @Test
  void aViewRegisteredAsABeanIsStillHydratedFromTheState() {
    assertThat(load(BeanView.class, "/bean-view", Map.of("name", "from state")))
        .contains("from state");
  }

  @Test
  void aNonStaticInnerClassIsBuiltInsideItsEnclosingInstance() {
    var factory =
        new ReflectionInstanceFactory(
            new BeanProvider() {
              @Override
              public <T> T getBean(Class<T> clazz) {
                return null;
              }

              @Override
              public <T> java.util.Collection<T> getBeans(Class<T> clazz) {
                return List.of();
              }
            });
    Outer.Inner inner = factory.newInstance(Outer.Inner.class, Map.of("value", "v"), null);
    assertThat(inner.outerTag()).isEqualTo("outer");
  }
}
