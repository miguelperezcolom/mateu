package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.core.testutil.TestMateu;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * A {@link io.mateu.uidl.interfaces.RouteEntrySupplier} authors routes IN CODE — the programmatic
 * half of the authored side, the symmetric counterpart of the REST source catalogue supplier. The
 * four behaviours that matter: a supplied route resolves and renders, it can pin parameters an
 * annotation cannot express, it can have NO view model (a definition-only route), and an entry in
 * {@code routes.yaml} still wins over the code supplier on a collision.
 */
class RouteEntrySupplierSyncTest {

  private TestMateu mateu;

  @BeforeEach
  void setUp() {
    mateu = TestMateu.withUisAndBeans(List.of(new SuppliedRoutes()));
  }

  @AfterEach
  void tearDown() {
    mateu.close();
  }

  @Test
  void aCodeSuppliedRouteResolvesAndRenders() {
    var increment = mateu.sync("supplied/widget");
    assertThat(increment).isNotNull();
    assertThat(increment.fragments())
        .as("the code-supplied route's view should have rendered")
        .isNotEmpty();
  }

  @Test
  void aCodeSuppliedRoutePinsParametersAnnotationsCannotExpress() {
    var resolver = mateu.context().getBean(DefaultRoutedClassResolver.class);
    var resolved = resolver.resolve("supplied/pinned", null).orElseThrow();
    assertThat(resolved.resolvedClass()).isEqualTo(SuppliedRoutes.Widget.class);
    assertThat(resolved.entry().fixedParams()).containsEntry("mode", "compact");
  }

  @Test
  void aCodeSuppliedRouteCanHaveNoViewModel() {
    var registry = mateu.context().getBean(RouteRegistry.class);
    var match = registry.authored().match("supplied/static").orElseThrow();
    assertThat(match.entry().definition()).isEqualTo("about.yaml");
    assertThat(match.entry().viewModel()).isNull();
  }

  @Test
  void routesYamlWinsOverTheCodeSupplier() {
    var resolver = mateu.context().getBean(DefaultRoutedClassResolver.class);
    var resolved = resolver.resolve("tickets/open", null).orElseThrow();
    // routes.yaml maps tickets/open to RegistryRoutedViews$Tickets; the supplier's collider loses.
    assertThat(resolved.resolvedClass()).isEqualTo(RegistryRoutedViews.Tickets.class);
  }
}
