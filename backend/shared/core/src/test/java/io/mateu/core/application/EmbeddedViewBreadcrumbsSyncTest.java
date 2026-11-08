package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.EmbeddedView;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A Java form embedded as an island ({@link EmbeddedView}) is a block of the host page, not a page
 * of its own: its header must not draw the automatic breadcrumb trail, which traces the HOST's menu
 * and address (the Mateu Explorer's validation entry showed the host's trail above the island).
 * Routed on its own, the same form keeps its trail.
 */
class EmbeddedViewBreadcrumbsSyncTest {

  @UI("/embedded-sign-up")
  @Title("Sign up")
  public static class SignUpForm {
    String name;
    String email;
  }

  @UI("/embedded-form-host")
  public static class Host implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(new Text("The host"), new EmbeddedView(new SignUpForm()));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Host.class, SignUpForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static PageDto pageOf(Object root) {
    return WireWalk.all(root, io.mateu.dtos.ClientSideComponentDto.class).stream()
        .filter(c -> c.metadata() instanceof PageDto)
        .map(c -> (PageDto) c.metadata())
        .findFirst()
        .orElseThrow();
  }

  @Test
  void anEmbeddedFormDrawsNoTrailOfItsOwn() {
    var island =
        WireWalk.all(mateu.sync("/embedded-form-host"), ServerSideComponentDto.class).stream()
            .filter(c -> SignUpForm.class.getName().equals(c.serverSideType()))
            .findFirst()
            .orElseThrow();
    assertThat(pageOf(island).noBreadcrumbs()).isTrue();
  }

  @Test
  void theSameFormRoutedKeepsItsTrail() {
    assertThat(pageOf(mateu.sync("/embedded-sign-up")).noBreadcrumbs()).isNotEqualTo(Boolean.TRUE);
  }
}
