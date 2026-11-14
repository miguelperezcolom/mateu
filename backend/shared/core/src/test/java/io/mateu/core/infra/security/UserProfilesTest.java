package io.mateu.core.infra.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;

class UserProfilesTest {

  @Test
  void anOidcUserIsShownByNameEmailAndPicture() {
    var profile =
        UserProfiles.fromClaims(
            Map.of(
                "name", "Ana López",
                "email", "ana@example.com",
                "picture", "https://example.com/ana.png",
                "preferred_username", "ana"),
            "sub-1");
    assertThat(profile.name()).isEqualTo("Ana López");
    assertThat(profile.email()).isEqualTo("ana@example.com");
    assertThat(profile.picture()).isEqualTo("https://example.com/ana.png");
  }

  @Test
  void aGithubUserIsShownByNameAndAvatar() {
    var profile =
        UserProfiles.fromClaims(
            Map.of(
                "login", "miguelperezcolom",
                "name", "Miguel Pérez",
                "avatar_url", "https://avatars.githubusercontent.com/u/1"),
            "miguelperezcolom");
    assertThat(profile.name()).isEqualTo("Miguel Pérez");
    assertThat(profile.picture()).isEqualTo("https://avatars.githubusercontent.com/u/1");
    assertThat(profile.email()).isNull();
  }

  @Test
  void withoutANameTheLoginThenTheIdentitysNameIsShown() {
    assertThat(UserProfiles.fromClaims(Map.of("login", "octocat"), "42").name())
        .isEqualTo("octocat");
    assertThat(
            UserProfiles.fromClaims(Map.of("given_name", "Ana", "family_name", "López"), "x")
                .name())
        .isEqualTo("Ana López");
    assertThat(UserProfiles.fromClaims(Map.of(), "alice").name()).isEqualTo("alice");
  }

  @Test
  void onlyAnHttpPictureIsKept() {
    assertThat(UserProfiles.fromClaims(Map.of("picture", "javascript:alert(1)"), "a").picture())
        .isNull();
    assertThat(
            UserProfiles.fromClaims(
                    Map.of("picture", "data:x", "avatar_url", "https://a.example/1"), "a")
                .picture())
        .isEqualTo("https://a.example/1");
  }
}
