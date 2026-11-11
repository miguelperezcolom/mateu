package io.mateu.core.infra.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.uidl.security.SignInPlatform;
import io.mateu.uidl.security.SignInProvider;
import io.mateu.uidl.security.SignInProviderType;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The reference run of {@code conformance/client/sign-in.json}: settings (+ providers declared in
 * code) → the manifest's {@code auth} block and the page's {@code <meta name="mateu-auth">}, byte
 * for byte what the .NET and Python ports produce. {@code -Dsignin.corpus.write=true} rewrites the
 * expected members from this implementation (then review the diff).
 */
class SignInProvidersCorpusTest {

  private static final ObjectMapper JSON = new ObjectMapper();

  static Path corpus() {
    return Path.of(System.getProperty("user.dir"))
        .resolve("../../../conformance/client/sign-in.json")
        .normalize();
  }

  @Test
  void everyCaseResolvesAsTheCorpusSays() throws Exception {
    var root = (ObjectNode) JSON.readTree(Files.readString(corpus()));
    boolean write = Boolean.getBoolean("signin.corpus.write");
    for (JsonNode node : root.get("cases")) {
      var c = (ObjectNode) node;
      var settings = new HashMap<String, String>();
      c.get("settings")
          .fields()
          .forEachRemaining(e -> settings.put(e.getKey(), e.getValue().asText()));
      var warnings = new ArrayList<String>();
      var auth =
          SignInProviders.authBlock(settings::get, supplied(c.get("code")), null, warnings::add);
      var authJson = auth == null ? null : SignInProviders.toJson(auth);
      var meta = SignInProviders.meta(auth);
      if (write) {
        c.remove(List.of("auth", "meta", "warnings"));
        c.set("auth", authJson == null ? JSON.nullNode() : JSON.readTree(authJson));
        c.put("meta", meta);
        c.put("warnings", warnings.size());
        continue;
      }
      var name = c.get("name").asText();
      var expectedAuth = c.get("auth");
      assertThat(authJson)
          .as(name)
          .isEqualTo(
              expectedAuth == null || expectedAuth.isNull()
                  ? null
                  : SignInProviders.toJson(JSON.treeToValue(expectedAuth, Object.class)));
      var expectedMeta = c.get("meta");
      assertThat(meta)
          .as(name)
          .isEqualTo(expectedMeta == null || expectedMeta.isNull() ? null : expectedMeta.asText());
      assertThat(warnings).as(name + " " + warnings).hasSize(c.get("warnings").asInt());
    }
    if (write) {
      Files.writeString(
          corpus(), JSON.writerWithDefaultPrettyPrinter().writeValueAsString(root) + "\n");
    }
  }

  static SignInProviders.Supplied supplied(JsonNode code) {
    if (code == null || code.isNull()) {
      return SignInProviders.Supplied.NONE;
    }
    var providers = new ArrayList<SignInProvider>();
    for (JsonNode p : code.path("providers")) {
      providers.add(
          new SignInProvider(
              text(p, "id"),
              p.hasNonNull("type") ? SignInProviderType.valueOf(text(p, "type")) : null,
              text(p, "label"),
              text(p, "icon"),
              text(p, "issuer"),
              text(p, "clientId"),
              list(p, "scopes"),
              text(p, "audience"),
              text(p, "url"),
              p.hasNonNull("platforms")
                  ? list(p, "platforms").stream().map(SignInPlatform::valueOf).toList()
                  : null,
              p.hasNonNull("continueParam") ? p.get("continueParam").asBoolean() : null));
    }
    return new SignInProviders.Supplied(
        providers,
        code.hasNonNull("loginOnStart") ? code.get("loginOnStart").asBoolean() : null,
        text(code, "logoutUrl"));
  }

  private static String text(JsonNode node, String field) {
    return node.hasNonNull(field) ? node.get(field).asText() : null;
  }

  private static List<String> list(JsonNode node, String field) {
    if (!node.hasNonNull(field)) return null;
    var out = new ArrayList<String>();
    node.get(field).forEach(v -> out.add(v.asText()));
    return out;
  }
}
