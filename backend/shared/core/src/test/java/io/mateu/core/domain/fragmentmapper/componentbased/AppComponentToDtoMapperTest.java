package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToFragment;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppVariantDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Pair;
import io.mateu.uidl.interfaces.RouteResolver;
import java.util.List;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

class AppComponentToDtoMapperTest {

  @Test
  void mapsToAppDto() {
    var supplier =
        new AppSupplier() {
          @Override
          public String id() {
            return "sample-app";
          }

          @Override
          public App getApp(HttpRequest httpRequest) {
            return App.builder()
                .pageTitle("Fluent app")
                .title("Antonia")
                .subtitle("This is the subtitle bla, bla, bla")
                .variant(AppVariant.MENU_ON_TOP)
                .menu(
                    List.of(
                        new RouteLink("/home", "Home"),
                        new RouteLink("/page1", "Page 1"),
                        new RouteLink("/page2", "Page 2", true),
                        new ContentLink("/content0", "Content 0", (rq) -> new Text("Hola 0")),
                        new Menu(
                            "Page 3",
                            List.of(
                                new ContentLink(
                                    "/content1", "Content 1", (rq) -> new Text("Hola 1")),
                                new ContentLink(
                                    "/content2", "Content 2", (rq) -> new Text("Hola 2")),
                                new Menu(
                                    "Page 4",
                                    List.of(
                                        new ContentLink(
                                            "/content3", "Content 3", (rq) -> new Text("Hola 3")),
                                        new ContentLink(
                                            "/content4",
                                            "Content 4",
                                            (rq) -> new Text("Hola 4"))))))))
                .build();
          }
        };
    var expected =
        UIFragmentDto.builder()
            .targetComponentId("initiator")
            .action(UIFragmentActionDto.Replace)
            .component(
                new ClientSideComponentDto(
                    AppDto.builder()
                        .homeRoute("/page2")
                        .route("route")
                        .subtitle("This is the subtitle bla, bla, bla")
                        .title("Antonia")
                        .variant(AppVariantDto.MENU_ON_TOP)
                        .totalMenuOptions(10)
                        .menu(
                            List.of(
                                MenuOptionDto.builder()
                                    .label("Home")
                                    .destination(new GoToRouteDto("", "/home", null))
                                    .visible(true)
                                    .selected(false)
                                    .build(),
                                MenuOptionDto.builder()
                                    .label("Page 1")
                                    .destination(new GoToRouteDto("", "/page1", null))
                                    .visible(true)
                                    .selected(false)
                                    .build(),
                                MenuOptionDto.builder()
                                    .label("Page 2")
                                    .destination(new GoToRouteDto("", "/page2", null))
                                    .visible(true)
                                    .selected(true)
                                    .build(),
                                MenuOptionDto.builder()
                                    .label("Content 0")
                                    .destination(new GoToRouteDto("", "/content0", null))
                                    .visible(true)
                                    .selected(false)
                                    .build(),
                                MenuOptionDto.builder()
                                    .label("Page 3")
                                    .destination(null)
                                    .visible(true)
                                    .selected(false)
                                    .submenus(
                                        List.of(
                                            MenuOptionDto.builder()
                                                .label("Content 1")
                                                .destination(
                                                    new GoToRouteDto("", "/content1", null))
                                                .visible(true)
                                                .selected(false)
                                                .build(),
                                            MenuOptionDto.builder()
                                                .label("Content 2")
                                                .destination(
                                                    new GoToRouteDto("", "/content2", null))
                                                .visible(true)
                                                .selected(false)
                                                .build(),
                                            MenuOptionDto.builder()
                                                .label("Page 4")
                                                .destination(null)
                                                .visible(true)
                                                .selected(false)
                                                .submenus(
                                                    List.of(
                                                        MenuOptionDto.builder()
                                                            .label("Content 3")
                                                            .destination(
                                                                new GoToRouteDto(
                                                                    "", "/content3", null))
                                                            .visible(true)
                                                            .selected(false)
                                                            .build(),
                                                        MenuOptionDto.builder()
                                                            .label("Content 4")
                                                            .destination(
                                                                new GoToRouteDto(
                                                                    "", "/content4", null))
                                                            .visible(true)
                                                            .selected(false)
                                                            .build()))
                                                .build()))
                                    .build()))
                        .build(),
                    "component_id",
                    List.of(),
                    null,
                    null,
                    null))
            .state(supplier)
            .build();

    var dto =
        mapComponentToFragment(
            supplier,
            supplier.getApp(new FakeHttpRequest()),
            "base_url",
            "route",
            "consumed_route",
            "initiator",
            new FakeHttpRequest());
    assertNotNull(dto);
    assertThat(dto).usingRecursiveComparison().ignoringFields("component.id").isEqualTo(expected);
  }

  class MyAppSupplier implements AppSupplier, RouteResolver {
    @Override
    public App getApp(HttpRequest httpRequest) {
      return App.builder()
          .menu(
              List.of(
                  new RouteLink("/home", "Home"),
                  new RouteLink("/page1", "Page 1"),
                  new RouteLink("/nested-app", "Nested app")))
          .build();
    }

    @Override
    public Class<?> resolveRoute(String route, String consumedRoute, HttpRequest httpRequest) {
      return MyAppSupplier.class;
    }

    @Override
    public List<Pair<Pattern, Pattern>> supportedRoutesPatterns() {
      return List.of(new Pair(Pattern.compile(".*"), null));
    }

    @Override
    public String id() {
      return "myapp";
    }
  }

  @Test
  void mapsNestedAppToDto() {
    var supplier = new MyAppSupplier();
    var dto =
        mapComponentToFragment(
            supplier,
            supplier.getApp(new FakeHttpRequest()),
            "base_url",
            "/nested-app/page2",
            "consumed_route",
            "initiator",
            new FakeHttpRequest());
    assertNotNull(dto);
    assertInstanceOf(ClientSideComponentDto.class, dto.component());
    var appDto = (AppDto) ((ClientSideComponentDto) dto.component()).metadata();
    assertEquals("/nested-app/page2", appDto.homeRoute());
    assertEquals("", appDto.route());
  }
}
