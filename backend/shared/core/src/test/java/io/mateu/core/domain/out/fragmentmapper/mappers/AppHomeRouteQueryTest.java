package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Proxy;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * A deep link with a query ({@code /booking/bookings?status=Cancelled}) reaches the shell with the
 * query twice: in the URL the request was posted to (its parameters) and in the route itself. The
 * home route the shell hands the remote must carry it once — twice, the remote read the filter as
 * {@code Cancelled?status=Cancelled}, a value no enum has.
 */
class AppHomeRouteQueryTest {

  private static HttpRequest withParams(Map<String, String> params) {
    return (HttpRequest)
        Proxy.newProxyInstance(
            HttpRequest.class.getClassLoader(),
            new Class<?>[] {HttpRequest.class},
            (proxy, method, args) ->
                switch (method.getName()) {
                  case "getParameterNames" -> List.copyOf(params.keySet());
                  case "getParameterValue" -> params.get((String) args[0]);
                  default -> null;
                });
  }

  @Test
  void aRouteThatAlreadyCarriesItsQueryKeepsItOnce() {
    var route =
        AppHomeRouteResolver.addQueryParams(
            "/booking/bookings?status=Cancelled", withParams(Map.of("status", "Cancelled")));
    assertThat(route).isEqualTo("/booking/bookings?status=Cancelled");
  }

  @Test
  void aRouteWithoutItsQueryGetsTheRequestParameters() {
    var route =
        AppHomeRouteResolver.addQueryParams(
            "/booking/bookings", withParams(Map.of("ids", "4MBZS7,JXD3G6")));
    assertThat(route).isEqualTo("/booking/bookings?ids=4MBZS7,JXD3G6");
  }
}
