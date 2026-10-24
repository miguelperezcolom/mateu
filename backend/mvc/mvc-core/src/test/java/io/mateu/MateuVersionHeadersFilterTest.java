package io.mateu;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.versioning.AppBuild;
import java.lang.reflect.Field;
import java.util.List;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

/**
 * The servlet filter that stamps {@code X-Mateu-Build}: the header goes on Mateu's endpoints only,
 * up front when the build is already known, after the chain when the first request is what made it
 * known, and never onto a response that is already committed.
 */
class MateuVersionHeadersFilterTest {

  private Object savedTypes;
  private Object savedComputed;

  @BeforeEach
  void saveBuildState() throws Exception {
    savedTypes = field("exposedTypes").get(null);
    savedComputed = field("computed").get(null);
    AppBuild.register(null);
    System.clearProperty(AppBuild.SETTING);
  }

  @AfterEach
  void restoreBuildState() throws Exception {
    System.clearProperty(AppBuild.SETTING);
    field("exposedTypes").set(null, savedTypes);
    field("computed").set(null, savedComputed);
  }

  @Test
  void aRequestOutsideMateuIsLeftAlone() throws Exception {
    System.setProperty(AppBuild.SETTING, "ci-42");
    var response = new MockHttpServletResponse();

    new MateuVersionHeadersFilter()
        .doFilter(new MockHttpServletRequest("GET", "/products"), response, (rq, rs) -> {});

    assertThat(response.getHeader(AppBuild.HEADER)).isNull();
  }

  @Test
  void aKnownBuildIsSetBeforeTheChainRuns() throws Exception {
    System.setProperty(AppBuild.SETTING, "ci-42");
    var response = new MockHttpServletResponse();
    var seenByTheChain = new String[1];

    new MateuVersionHeadersFilter()
        .doFilter(
            mateuRequest(),
            response,
            (rq, rs) ->
                seenByTheChain[0] = ((MockHttpServletResponse) rs).getHeader(AppBuild.HEADER));

    assertThat(seenByTheChain[0]).isEqualTo("ci-42");
    assertThat(response.getHeader(AppBuild.HEADER)).isEqualTo("ci-42");
  }

  @Test
  void aBuildTheFirstRequestMadeKnownIsSetAfterTheChain() throws Exception {
    var response = new MockHttpServletResponse();
    Supplier<java.util.Collection<String>> types = List::of;

    new MateuVersionHeadersFilter()
        .doFilter(mateuRequest(), response, (rq, rs) -> AppBuild.register(types));

    assertThat(response.getHeader(AppBuild.HEADER)).isNotBlank();
  }

  @Test
  void anUnknownBuildLeavesTheHeaderOut() throws Exception {
    var response = new MockHttpServletResponse();

    new MateuVersionHeadersFilter().doFilter(mateuRequest(), response, (rq, rs) -> {});

    assertThat(response.getHeader(AppBuild.HEADER)).isNull();
  }

  @Test
  void aCommittedResponseIsNotTouchedAfterTheChain() throws Exception {
    var response = new MockHttpServletResponse();
    Supplier<java.util.Collection<String>> types = List::of;

    new MateuVersionHeadersFilter()
        .doFilter(
            mateuRequest(),
            response,
            (rq, rs) -> {
              rs.flushBuffer();
              AppBuild.register(types);
            });

    assertThat(response.getHeader(AppBuild.HEADER)).isNull();
  }

  private static MockHttpServletRequest mateuRequest() {
    var request = new MockHttpServletRequest("POST", "/mateu/v3/sync/products");
    request.addHeader("X-Mateu-Renderer", "vaadin/test wire/3.0");
    return request;
  }

  private static Field field(String name) throws Exception {
    Field f = AppBuild.class.getDeclaredField(name);
    f.setAccessible(true);
    return f;
  }
}
