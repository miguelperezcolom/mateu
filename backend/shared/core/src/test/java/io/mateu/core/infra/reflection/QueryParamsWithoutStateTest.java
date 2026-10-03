package io.mateu.core.infra.reflection;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.infra.HeadlessHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import java.util.Collection;
import java.util.List;
import org.junit.jupiter.api.Test;

/** Query parameters hydrate the instance even when the request carries no state map at all. */
class QueryParamsWithoutStateTest {

  public static class Page {
    public String q;
  }

  private static final BeanProvider NO_BEANS =
      new BeanProvider() {
        @Override
        public <T> T getBean(Class<T> clazz) {
          return null;
        }

        @Override
        public <T> Collection<T> getBeans(Class<T> clazz) {
          return List.of();
        }
      };

  @Test
  void queryParametersAreAppliedWhenDataIsNull() {
    var request =
        new HeadlessHttpRequest(RunActionRqDto.builder().build()) {
          @Override
          public List<String> getParameterNames() {
            return List.of("q");
          }

          @Override
          public String getParameterValue(String name) {
            return "q".equals(name) ? "shoes" : null;
          }
        };

    var page =
        (Page)
            new ReflectionInstanceFactory(NO_BEANS)
                .createInstance(Page.class.getName(), null, request)
                .block();

    assertThat(page.q).isEqualTo("shoes");
  }
}
