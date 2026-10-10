package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import io.mateu.core.domain.Authorizer;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.Access;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import org.junit.jupiter.api.Test;

/** The YAML access pass, on trees — the per-request rewrite the loaders apply before mapping. */
class YamlAccessTest {

  private static final ObjectMapper YAML = new ObjectMapper(new YAMLFactory());

  private static FakeHttpRequest withClaims(String claimsJson) {
    var enc = Base64.getUrlEncoder().withoutPadding();
    var token =
        enc.encodeToString("{}".getBytes(StandardCharsets.UTF_8))
            + "."
            + enc.encodeToString(claimsJson.getBytes(StandardCharsets.UTF_8))
            + ".sig";
    return new FakeHttpRequest(RunActionRqDto.builder().build())
        .withHeader("Authorization", "Bearer " + token);
  }

  @Test
  void theDataSpellingUsesTheSamePredicateAsTheAnnotations() {
    var hrInSales = withClaims("{\"roles\":[\"hr\"],\"groups\":[\"sales\"],\"scope\":\"read\"}");
    // AND across declared dimensions, OR within one
    assertThat(
            Authorizer.isAuthorized(
                new Access(List.of("admin", "hr"), List.of("sales"), null, null), hrInSales))
        .isTrue();
    assertThat(
            Authorizer.isAuthorized(
                new Access(List.of("hr"), List.of("finance"), null, null), hrInSales))
        .isFalse();
    assertThat(Authorizer.isAuthorized(new Access(null, null, List.of("read"), null), hrInSales))
        .isTrue();
    // nothing declared = unrestricted; something declared and no token = denied
    assertThat(Authorizer.isAuthorized(new Access(null, null, null, null), null)).isTrue();
    assertThat(Authorizer.isAuthorized(Access.roles("hr"), null)).isFalse();
  }

  @Test
  void theShorthandsMeanRoles() throws Exception {
    assertThat(YamlAccess.accessOf(YAML.readTree("admin")).roles()).containsExactly("admin");
    assertThat(YamlAccess.accessOf(YAML.readTree("[a, b]")).roles()).containsExactly("a", "b");
    assertThat(YamlAccess.accessOf(YAML.readTree("{permissions: [x]}")).permissions())
        .containsExactly("x");
    assertThat(YamlAccess.accessOf(YAML.readTree("{}"))).isNull();
  }

  @Test
  void aTreeWithoutAccessKeysIsNotRequestDependent() throws Exception {
    assertThat(YamlAccess.declaresAccess(YAML.readTree("{layout: {type: Text, text: hi}}")))
        .isFalse();
    assertThat(
            YamlAccess.declaresAccess(
                YAML.readTree("{layout: {type: Text, text: hi, eyesOnly: {roles: [x]}}}")))
        .isTrue();
  }

  @Test
  void readOnlyUnlessOnAContainerLocksEveryFieldUnderIt() throws Exception {
    var tree =
        YAML.readTree(
            """
            layout:
              type: FormLayout
              readOnlyUnless: {roles: [hr]}
              content:
                - {type: FormField, id: a}
                - type: HorizontalLayout
                  content:
                    - {type: FormField, id: b}
            """);
    var applied = YamlAccess.apply(tree, null, null);
    assertThat(applied.lockedFields()).containsExactlyInAnyOrder("a", "b");
    assertThat(applied.tree().toString()).doesNotContain("readOnlyUnless");
    assertThat(applied.tree().at("/layout/content/1/content/0/readOnly").asBoolean()).isTrue();
    // the source tree is untouched: it is shared by every request
    assertThat(tree.toString()).contains("readOnlyUnless");
  }

  @Test
  void aHiddenSectionTakesItsFieldsWithItAndTheyAreLocked() throws Exception {
    var tree =
        YAML.readTree(
            """
            layout:
              type: VerticalLayout
              content:
                - type: Card
                  access: {roles: [hr]}
                  content: {type: FormField, id: salary}
                - {type: FormField, id: name}
            """);
    var applied = YamlAccess.apply(tree, withClaims("{\"roles\":[\"staff\"]}"), null);
    assertThat(applied.tree().at("/layout/content")).hasSize(1);
    assertThat(applied.lockedFields()).containsExactly("salary");
  }
}
