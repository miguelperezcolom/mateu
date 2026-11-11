package io.mateu.core.infra.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.IndexPage;
import io.mateu.core.infra.MobileManifest;
import io.mateu.uidl.security.SignInProvider;
import io.mateu.uidl.security.SignInProvidersSupplier;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/** Where the providers reach: the served page (every renderer, every adapter) and the manifest. */
class SignInProvidersTest {

  static final String VITE_PAGE =
      """
      <html><head><!-- AQUIFAVICON --><title>AQUIELTITULODELAPAGINA</title>
      <script type="module" crossorigin src="/assets/mateu-vaadin.js"></script>
      </head><body><!-- AQUIUI --><mateu-ui></mateu-ui><!-- HASTAAQUIUI --></body></html>
      """;

  static final String VB_PAGE =
      """
      <html><head><title>AQUIELTITULODELAPAGINA</title>
      <script type="text/mateu-deferred" data-src="https://static.oracle.com/require.js"></script>
      </head><body><!-- AQUIUI --><!-- HASTAAQUIUI --></body></html>
      """;

  @AfterEach
  void clear() {
    for (var key :
        List.of(
            "mateu.auth.providers",
            "mateu.auth.providers.github.url",
            "mateu.auth.providers.keycloak.issuer",
            "mateu.auth.providers.keycloak.client-id",
            "mateu.auth.providers.keycloak.platforms")) {
      System.clearProperty(key);
    }
  }

  @Test
  void aPageWithoutProvidersCarriesNoMeta() {
    assertThat(IndexPage.render(VITE_PAGE, IndexPage.Spec.of("", "T")))
        .doesNotContain("mateu-auth");
  }

  @Test
  void theVaadinAndTheRedwoodPagesCarryTheWebProviders() {
    System.setProperty("mateu.auth.providers", "github");
    var meta =
        "<meta name=\"mateu-auth\" content=\"{&quot;loginOnStart&quot;:true,&quot;providers&quot;:"
            + "[{&quot;id&quot;:&quot;github&quot;,&quot;type&quot;:&quot;redirect&quot;,"
            + "&quot;label&quot;:&quot;GitHub&quot;,&quot;icon&quot;:&quot;github&quot;,"
            + "&quot;url&quot;:&quot;/oauth2/authorization/github&quot;,"
            + "&quot;platforms&quot;:[&quot;web&quot;]}]}\">";
    var vaadin = IndexPage.render(VITE_PAGE, IndexPage.Spec.of("/crm", "T"));
    assertThat(vaadin).contains(meta);
    var redwood = IndexPage.render(VB_PAGE, IndexPage.Spec.of("", "T"));
    assertThat(redwood).contains(meta);
    // a meta, not a script: the page's CSP hashes are the same with or without it
    System.clearProperty("mateu.auth.providers");
    assertThat(IndexPage.inlineScriptHashes(redwood))
        .isEqualTo(
            IndexPage.inlineScriptHashes(IndexPage.render(VB_PAGE, IndexPage.Spec.of("", "T"))));
  }

  @Test
  void aNativeOnlyProviderReachesTheManifestButNotThePage() {
    System.setProperty("mateu.auth.providers", "keycloak");
    System.setProperty("mateu.auth.providers.keycloak.issuer", "https://sso.example.com/realms/a");
    System.setProperty("mateu.auth.providers.keycloak.client-id", "app");
    System.setProperty("mateu.auth.providers.keycloak.platforms", "mobile");
    assertThat(IndexPage.render(VITE_PAGE, IndexPage.Spec.of("", "T")))
        .doesNotContain("mateu-auth");
    assertThat(MobileManifest.json((io.mateu.uidl.fluent.AppShell) null))
        .contains("\"auth\":{\"type\":\"oidc\",\"issuer\":\"https://sso.example.com/realms/a\"");
  }

  @Test
  void aSupplierBeanDeclaresThemInCode() {
    SignInProvidersSupplier supplier =
        new SignInProvidersSupplier() {
          @Override
          public List<SignInProvider> signInProviders() {
            return List.of(
                SignInProvider.oidc("acme", "Acme SSO", "https://idp.acme.com", "ui"),
                SignInProvider.preset("github"));
          }

          @Override
          public String logoutUrl() {
            return "/logout";
          }
        };
    var auth =
        SignInProviders.authBlock(
            k -> null, SignInProviders.suppliedBy(List.of(supplier)), null, w -> {});
    assertThat(SignInProviders.toJson(auth))
        .isEqualTo(
            "{\"type\":\"oidc\",\"issuer\":\"https://idp.acme.com\",\"clientId\":\"ui\","
                + "\"scopes\":[\"openid\",\"profile\"],\"loginOnStart\":true,\"providers\":["
                + "{\"id\":\"acme\",\"type\":\"oidc\",\"label\":\"Acme SSO\",\"icon\":\"key\","
                + "\"issuer\":\"https://idp.acme.com\",\"clientId\":\"ui\","
                + "\"scopes\":[\"openid\",\"profile\"],\"platforms\":[\"web\",\"mobile\",\"desktop\"]},"
                + "{\"id\":\"github\",\"type\":\"redirect\",\"label\":\"GitHub\",\"icon\":\"github\","
                + "\"url\":\"/oauth2/authorization/github\",\"platforms\":[\"web\"]}],"
                + "\"logoutUrl\":\"/logout\"}");
  }

  @Test
  void anUnusableProviderIsWarnedAtStartupWithoutFailing() {
    System.setProperty("mateu.auth.providers", "keycloak");
    SignInProviders.warnOnStartup();
    var warnings = new ArrayList<String>();
    SignInProviders.authBlock(
        System::getProperty, SignInProviders.Supplied.NONE, null, warnings::add);
    assertThat(warnings).singleElement().asString().contains("keycloak").contains("issuer");
  }

  @Test
  void labelsOfIdsWithoutPreset() {
    assertThat(SignInProviders.humanize("acme-sso")).isEqualTo("Acme sso");
    assertThat(SignInProviders.humanize("partners")).isEqualTo("Partners");
  }
}
