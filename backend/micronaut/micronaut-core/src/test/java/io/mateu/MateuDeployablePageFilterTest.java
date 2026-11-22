package io.mateu;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpStatus;
import org.junit.jupiter.api.Test;

/**
 * The filter on its own: only a GET or HEAD of the deployable page is hidden. The test classpath's
 * {@code static/index.html} carries the deployable page's marker, like a renderer jar's.
 */
class MateuDeployablePageFilterTest {

  final MateuDeployablePageFilter filter = new MateuDeployablePageFilter();

  @Test
  void hidesTheFileOnAGet() {
    assertEquals(HttpStatus.NOT_FOUND, filter.hide(HttpRequest.GET("/index.html")).getStatus());
  }

  @Test
  void hidesTheFileOnAHead() {
    assertEquals(HttpStatus.NOT_FOUND, filter.hide(HttpRequest.HEAD("/index.html")).getStatus());
  }

  @Test
  void letsOtherMethodsThrough() {
    assertNull(filter.hide(HttpRequest.POST("/index.html", "")));
    assertNull(filter.hide(HttpRequest.DELETE("/")));
  }

  @Test
  void letsOtherPathsThrough() {
    assertNull(filter.hide(HttpRequest.GET("/assets/fixed.js")));
  }
}
