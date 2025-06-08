package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.fragmentmapper.componentbased.ComponentToFragmentDtoMapper.mapComponentToFragment;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.AppVariantDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.GoToRouteDto;
import io.mateu.dtos.MenuDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.TextComponent;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;
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
          public App getApp(HttpRequest httpRequest) {
            return App.builder()
                .pageTitle("Fluent app")
                .title("Antonia")
                .subtitle("This is the subtitle bla, bla, bla")
                .variant(AppVariant.MENU_ON_TOP)
                .menu(
                    List.of(
                        new RouteLink("/fluent-app/home", "Home"),
                        new RouteLink("/fluent-app/page1", "Page 1"),
                        new RouteLink("/fluent-app/page2", "Page 2", true),
                        new ContentLink(
                            "/fluent-app/content0",
                            "Content 0",
                            (rq) -> new TextComponent("Hola 0")),
                        new Menu(
                            "Page 3",
                            List.of(
                                new ContentLink(
                                    "/fluent-app/content1",
                                    "Content 1",
                                    (rq) -> new TextComponent("Hola 1")),
                                new ContentLink(
                                    "/fluent-app/content2",
                                    "Content 2",
                                    (rq) -> new TextComponent("Hola 2")),
                                new Menu(
                                    "Page 4",
                                    List.of(
                                        new ContentLink(
                                            "/fluent-app/content3",
                                            "Content 3",
                                            (rq) -> new TextComponent("Hola 3")),
                                        new ContentLink(
                                            "/fluent-app/content4",
                                            "Content 4",
                                            (rq) -> new TextComponent("Hola 4"))))))))
                .build();
          }
        };
    var expected =
        UIFragmentDto.builder()
            .targetComponentId("initiator")
            .component(
                new ComponentDto(
                    AppDto.builder()
                        .homeRoute("/fluent-app/page2")
                        .route("route")
                        .subtitle("This is the subtitle bla, bla, bla")
                        .title("Antonia")
                        .variant(AppVariantDto.MENU_ON_TOP)
                        .menu(
                            List.of(
                                MenuDto.builder()
                                    .label("Home")
                                    .destination(new GoToRouteDto("", "/fluent-app/home", null))
                                    .visible(true)
                                    .selected(false)
                                    .build(),
                                MenuDto.builder()
                                    .label("Page 1")
                                    .destination(new GoToRouteDto("", "/fluent-app/page1", null))
                                    .visible(true)
                                    .selected(false)
                                    .build(),
                                MenuDto.builder()
                                    .label("Page 2")
                                    .destination(new GoToRouteDto("", "/fluent-app/page2", null))
                                    .visible(true)
                                    .selected(true)
                                    .build(),
                                MenuDto.builder()
                                    .label("Content 0")
                                    .destination(new GoToRouteDto("", "/fluent-app/content0", null))
                                    .visible(true)
                                    .selected(false)
                                    .build(),
                                MenuDto.builder()
                                    .label("Page 3")
                                    .destination(null)
                                    .visible(true)
                                    .selected(false)
                                    .submenus(
                                        List.of(
                                            MenuDto.builder()
                                                .label("Content 1")
                                                .destination(
                                                    new GoToRouteDto(
                                                        "", "/fluent-app/content1", null))
                                                .visible(true)
                                                .selected(false)
                                                .build(),
                                            MenuDto.builder()
                                                .label("Content 2")
                                                .destination(
                                                    new GoToRouteDto(
                                                        "", "/fluent-app/content2", null))
                                                .visible(true)
                                                .selected(false)
                                                .build(),
                                            MenuDto.builder()
                                                .label("Page 4")
                                                .destination(null)
                                                .visible(true)
                                                .selected(false)
                                                .submenus(
                                                    List.of(
                                                        MenuDto.builder()
                                                            .label("Content 3")
                                                            .destination(
                                                                new GoToRouteDto(
                                                                    "",
                                                                    "/fluent-app/content3",
                                                                    null))
                                                            .visible(true)
                                                            .selected(false)
                                                            .build(),
                                                        MenuDto.builder()
                                                            .label("Content 4")
                                                            .destination(
                                                                new GoToRouteDto(
                                                                    "",
                                                                    "/fluent-app/content4",
                                                                    null))
                                                            .visible(true)
                                                            .selected(false)
                                                            .build()))
                                                .build()))
                                    .build()))
                        .build(),
                    "component_id",
                    supplier.getClass().getName(),
                    List.of()))
            .data(supplier)
            .build();

    var dto =
        mapComponentToFragment(
            supplier,
            supplier.getApp(new FakeHttpRequest()),
            "base_url",
            "route",
            "initiator",
            new FakeHttpRequest());
    assertNotNull(dto);
    assertThat(dto).usingRecursiveComparison().isEqualTo(expected);
  }

  class MyAppSupplier implements AppSupplier, RouteResolver {
    @Override
    public App getApp(HttpRequest httpRequest) {
      return App.builder()
          .menu(
              List.of(
                  new RouteLink("/fluent-app/home", "Home"),
                  new RouteLink("/fluent-app/page1", "Page 1"),
                  new RouteLink("/fluent-app/nested-app", "Nested app")))
          .build();
    }

    @Override
    public Class<?> resolveRoute(String route, HttpRequest httpRequest) {
      return MyAppSupplier.class;
    }

    @Override
    public List<Pattern> getSupportedRoutesPatterns() {
      return List.of(Pattern.compile("/fluent-app.*"));
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
            "/fluent-app/nested-app/page2",
            "initiator",
            new FakeHttpRequest());
    assertNotNull(dto);
    assertInstanceOf(AppDto.class, dto.component().metadata());
    var appDto = (AppDto) dto.component().metadata();
    assertEquals("/fluent-app/nested-app/page2", appDto.homeRoute());
    assertEquals("/fluent-app", appDto.route());
  }
}
