package io.mateu.annotationprocessing;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.Test;

/**
 * The framework AP as a consumer's javac runs it: real annotations on real sources, generated files
 * on disk. The templates under src/test/resources/templates stand in for a framework's.
 */
public class GeneratedControllersCompileTest {

  private static Javac.Result process(Map<String, String> sources) {
    return Javac.compile(List.of(new MateuUIAnnotationProcessor()), sources);
  }

  @Test
  public void aUiMountGeneratesItsIndexControllerMateuControllerConfigAndRouteResolver() {
    var result =
        process(
            Map.of(
                "com.acme.Admin",
                """
                package com.acme;
                @io.mateu.uidl.annotations.UI("/admin")
                public class Admin {}
                """));

    assertThat(result.errors()).isEmpty();
    assertThat(result.generatedClassNames())
        .contains(
            "com.acme.AdminController",
            "com.acme.AdminMateuController",
            "com.acme.AdminConfig",
            "com.acme.AdminUIRouteResolver");
    assertThat(result.generatedSource("com.acme.AdminMateuController"))
        .contains("@RequestMapping(\"/admin/mateu\")")
        .contains("private String uiId = \"com.acme.Admin\";");
    assertThat(result.generatedSource("com.acme.AdminController"))
        .contains("\"/static/_index.html\"")
        .contains("src='/admin/assets/mateu.js'");
    assertThat(result.generatedSource("com.acme.AdminUIRouteResolver"))
        .contains("return Admin.class;")
        .contains("new CompiledRouteValue(\"/admin\", \"_empty\"");
  }

  /** A trailing slash is the same mount: the API lives at /shop/mateu, not /shop//mateu. */
  @Test
  public void aTrailingSlashIsDroppedFromTheApiPath() {
    var result =
        process(
            Map.of(
                "com.acme.Shop",
                "package com.acme; @io.mateu.uidl.annotations.UI(\"/shop/\") public class Shop {}"));

    assertThat(result.generatedSource("com.acme.ShopMateuController"))
        .contains("@RequestMapping(\"/shop/mateu\")");
  }

  /**
   * {@code @App(route)} wins over {@code @UI}, and a class carrying both generates ONE set of files
   * — a second set would be javac's "Attempt to recreate a file" error.
   */
  @Test
  public void appRouteWinsOverUiAndTheClassIsGeneratedOnce() {
    var result =
        process(
            Map.of(
                "com.acme.Both",
                """
                package com.acme;
                @io.mateu.uidl.annotations.UI("/old")
                @io.mateu.uidl.annotations.App(route = "/new")
                public class Both {}
                """));

    assertThat(result.errors()).isEmpty();
    assertThat(result.generatedSource("com.acme.BothMateuController"))
        .contains("@RequestMapping(\"/new/mateu\")")
        .doesNotContain("/old");
  }

  /**
   * A class routed only by {@code @App(route)} has no {@code @UI} to read the frontend paths from,
   * so it must get @UI's own defaults — otherwise its index page points at files that do not exist
   * and the SPA never boots.
   */
  @Test
  public void anAppOnlyRouteServesTheDefaultIndexPageAndBundle() {
    var result =
        process(
            Map.of(
                "com.acme.Store",
                "package com.acme; @io.mateu.uidl.annotations.App(route = \"/store\") public class"
                    + " Store {}"));

    assertThat(result.generatedSource("com.acme.StoreController"))
        .contains("\"/static/_index.html\"")
        .contains("src='/store/assets/mateu.js'");
  }

  /** An {@code @App} with no route is chrome only: nothing is mounted for it. */
  @Test
  public void anAppWithoutARouteMountsNothing() {
    var result =
        process(
            Map.of(
                "com.acme.Chrome",
                "package com.acme; @io.mateu.uidl.annotations.App(themeToggle = true) public class"
                    + " Chrome {}"));

    assertThat(result.errors()).isEmpty();
    assertThat(result.generatedClassNames()).noneMatch(n -> n.startsWith("com.acme."));
  }

  /** A bundle served from a CDN is used as written, not glued onto the mount path. */
  @Test
  public void anAbsoluteFrontendBundleUrlIsNotPrefixedWithTheMount() {
    var result =
        process(
            Map.of(
                "com.acme.Cdn",
                """
                package com.acme;
                @io.mateu.uidl.annotations.UI(value = "/cdn",
                    frontendComponentPath = "https://cdn.example.com/mateu.js",
                    indexHtmlPath = "/static/custom.html")
                public class Cdn {}
                """));

    assertThat(result.generatedSource("com.acme.CdnController"))
        .contains("src='https://cdn.example.com/mateu.js'")
        .contains("\"/static/custom.html\"")
        .doesNotContain("/cdnhttps");
  }

  @Test
  @SuppressWarnings("removal")
  public void keycloakSecuredBootsThroughKeycloakWithTheDefaultAdapterUrl() {
    var result =
        process(
            Map.of(
                "com.acme.Secure",
                """
                package com.acme;
                @io.mateu.uidl.annotations.UI("/secure")
                @io.mateu.uidl.annotations.KeycloakSecured(
                    url = "https://auth.example.com", realm = "acme", clientId = "web")
                public class Secure {}
                """));

    assertThat(result.generatedSource("com.acme.SecureController"))
        .contains("url: 'https://auth.example.com'")
        .contains("realm: 'acme'")
        .contains("clientId: 'web'")
        .contains("<script src='https://esm.sh/keycloak-js@26.2.2'></script>")
        .contains("onload='initKeycloak()'");
  }

  @Test
  public void metasLinksAndScriptsAreInjectedIntoTheHead() {
    var result =
        process(
            Map.of(
                "com.acme.Head",
                """
                package com.acme;
                import io.mateu.uidl.annotations.*;
                @UI("/head")
                @Meta(name = "theme-color", content = "#123456")
                @Meta(httpEquiv = "X-UA-Compatible", content = "IE=edge")
                @Link(rel = "preload", href = "/font.woff2", as = "font", type = "font/woff2",
                    crossorigin = true)
                @Script(src = "/a.js", type = "module", defer = true, async = true, crossorigin = true)
                public class Head {}
                """));

    assertThat(result.generatedSource("com.acme.HeadController"))
        .contains("<meta name=\\\"theme-color\\\" content=\\\"#123456\\\">")
        .contains("<meta http-equiv=\\\"X-UA-Compatible\\\" content=\\\"IE=edge\\\">")
        .contains(
            "<link rel=\\\"preload\\\" href=\\\"/font.woff2\\\" type=\\\"font/woff2\\\""
                + " as=\\\"font\\\" crossorigin>")
        .contains("<script type=\\\"module\\\" src=\\\"/a.js\\\" crossorigin defer async></script>")
        .contains("html.replace(\"</head>\", extraHead + \"</head>\");");
  }

  /** {@code ""} and {@code "/"} are the same root: two classes there are a compile error. */
  @Test
  public void twoMountsOnTheRootFailTheCompilationNamingBothClasses() {
    var result =
        process(
            Map.of(
                "com.acme.Home",
                "package com.acme; @io.mateu.uidl.annotations.UI(\"\") public class Home {}",
                "com.acme.Landing",
                "package com.acme; @io.mateu.uidl.annotations.UI(\"/\") public class Landing {}"));

    assertThat(result.errors())
        .singleElement()
        .satisfies(
            e ->
                assertThat(e)
                    .contains("com.acme.Home")
                    .contains("com.acme.Landing")
                    .contains("routes.yaml"));
  }

  /**
   * The root mount gets the explicit empty route on top of its own (the resolver must answer both
   * the bare root and the initial {@code _empty} load).
   */
  @Test
  public void theRootMountResolvesTheEmptyRouteTwice() {
    var result =
        process(
            Map.of(
                "com.acme.Root",
                "package com.acme; @io.mateu.uidl.annotations.UI(\"\") public class Root {}"));

    String resolver = result.generatedSource("com.acme.RootUIRouteResolver");
    assertThat(resolver.split("new CompiledRouteValue\\(\"\", \"_empty\"", -1)).hasSize(3);
  }
}
