package io.mateu.adapter;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.SpringBeanProvider;
import io.mateu.SpringHttpRequest;
import org.junit.jupiter.api.Test;
import org.springframework.context.support.GenericApplicationContext;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;

/**
 * The adapter contract every framework honours: an absent parameter/header is an empty list (not
 * null), and a class that is not a bean is simply null — no exception.
 */
class SpringAdapterContractTest {

  @Test
  void absentParametersAndHeadersAreEmptyLists() {
    var request = new SpringHttpRequest(MockServerHttpRequest.get("/x?a=1").build());

    assertThat(request.getParameterValues("a")).containsExactly("1");
    assertThat(request.getParameterValues("missing")).isEmpty();
    assertThat(request.getHeaderValues("X-Missing")).isEmpty();
  }

  public static class Service {}

  public static class NotABean {}

  @Test
  void beanLookupsAnswerTheBeanOrNull() {
    var context = new GenericApplicationContext();
    context.registerBean(Service.class);
    context.refresh();
    var provider = new SpringBeanProvider(context);

    assertThat(provider.getBean(Service.class)).isNotNull();
    assertThat(provider.getBean(NotABean.class)).isNull();
    assertThat(provider.getBeans(NotABean.class)).isEmpty();
  }
}
