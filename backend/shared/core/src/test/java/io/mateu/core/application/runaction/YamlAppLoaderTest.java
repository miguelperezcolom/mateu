package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppVariant;
import org.junit.jupiter.api.Test;

/**
 * The app loader builds an {@link io.mateu.uidl.fluent.AppShell} from the {@code app:} block of
 * {@code routes.yaml} — the data-driven counterpart of an {@code @App} class. Menu items and
 * widgets ride the same polymorphic {@code type:} discriminator as page layouts, so they need no
 * extra wiring here.
 */
class YamlAppLoaderTest {

  private final YamlAppLoader loader = new YamlAppLoader();
  private final com.fasterxml.jackson.databind.ObjectMapper mapper = YamlUidlMapperFactory.create();

  private io.mateu.uidl.fluent.AppShell parse(String yaml) throws Exception {
    return loader.parse(mapper.readTree(yaml));
  }

  @Test
  void scalarsMenuAndWidgetsAreReadOffTheAppBlock() throws Exception {
    var app =
        parse(
            """
            app:
              title: Back office
              subtitle: Operations
              logo: /logo.png
              variant: MENU_ON_TOP
              menu:
                - type: RouteLink
                  label: Orders
                  route: orders
                  icon: vaadin:cart
                - type: Menu
                  label: Admin
                  submenu:
                    - type: RouteLink
                      label: Users
                      route: users
              widgets:
                - type: Text
                  text: v3.0
            routes:
              - route: orders
                definition: orders.yaml
            """);

    assertThat(app).isNotNull();
    assertThat(app.title()).isEqualTo("Back office");
    assertThat(app.subtitle()).isEqualTo("Operations");
    assertThat(app.logo()).isEqualTo("/logo.png");
    assertThat(app.variant()).isEqualTo(AppVariant.MENU_ON_TOP);

    assertThat(app.menu()).hasSize(2);
    assertThat(app.menu().get(0))
        .isInstanceOfSatisfying(
            RouteLink.class,
            link -> {
              assertThat(link.label()).isEqualTo("Orders");
              assertThat(link.route()).isEqualTo("orders");
              assertThat(link.icon()).isEqualTo("vaadin:cart");
            });
    assertThat(app.menu().get(1))
        .isInstanceOfSatisfying(
            Menu.class,
            m -> {
              assertThat(m.label()).isEqualTo("Admin");
              assertThat(m.submenu()).hasSize(1);
              assertThat(m.submenu().get(0)).isInstanceOf(RouteLink.class);
            });

    assertThat(app.widgets()).hasSize(1);
    // No explicit homeRoute: defaults to the first navigable menu item, so the shell loads content
    // instead of re-loading its own root route.
    assertThat(app.homeRoute()).isEqualTo("orders");
  }

  @Test
  void anExplicitHomeRouteWinsOverTheFirstMenuItem() throws Exception {
    var app =
        parse(
            """
            app:
              title: X
              homeRoute: dashboard
              menu:
                - type: RouteLink
                  label: Orders
                  route: orders
            """);
    assertThat(app.homeRoute()).isEqualTo("dashboard");
  }

  @Test
  void anUnknownVariantFallsBackInsteadOfFailing() throws Exception {
    var app =
        parse(
            """
            app:
              title: X
              variant: NOT_A_VARIANT
            """);
    assertThat(app.variant()).isEqualTo(AppVariant.AUTO);
  }

  @Test
  void aFileWithNoAppBlockYieldsNullRatherThanAnEmptyShell() throws Exception {
    var app =
        parse(
            """
            routes:
              - route: orders
                viewModel: com.acme.Orders
            """);
    assertThat(app).isNull();
  }
}
