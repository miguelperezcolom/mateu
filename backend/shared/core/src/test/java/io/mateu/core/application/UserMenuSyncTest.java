package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.security.UserProfile;
import io.mateu.uidl.security.UserProfileSupplier;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The header's user menu: the app shell names the signed-in user ({@code AppDto.user}) — from an
 * app's {@link UserProfileSupplier} when it answers, else from the identity the framework
 * authenticated — and nobody for an anonymous caller.
 */
class UserMenuSyncTest {

  @SuppressWarnings("unused")
  @UI("/user-menu")
  @Title("User menu")
  @App
  public static class UserMenuApp {
    @Menu String home = "/";
  }

  /** Knows how to show "ana"; says nothing about anyone else. */
  public static class Directory implements UserProfileSupplier {
    @Override
    public Optional<UserProfile> profile(io.mateu.uidl.interfaces.HttpRequest httpRequest) {
      var roles = httpRequest.getHeaderValue(TestIdentities.ROLES_HEADER);
      return "ana".equals(roles)
          ? Optional.of(
              new UserProfile("Ana López", "ana@example.com", "https://example.com/ana.png"))
          : Optional.empty();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new Directory()), UserMenuApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private AppDto app(Map<String, String> headers) {
    var increment =
        mateu.run(RunActionRqDto.builder().route("/user-menu").actionId("").build(), headers);
    return FullSyncPipelineTest.findMetadata(
        increment.fragments().get(0).component(), AppDto.class);
  }

  @Test
  void anAnonymousCallerIsNamedNowhere() {
    assertThat(app(Map.of()).user()).isNull();
  }

  @Test
  void theAppsSupplierDecidesHowAUserIsShown() {
    var user = app(TestIdentities.headersWithRoles("ana")).user();
    assertThat(user.name()).isEqualTo("Ana López");
    assertThat(user.email()).isEqualTo("ana@example.com");
    assertThat(user.picture()).isEqualTo("https://example.com/ana.png");
  }

  @Test
  void whenTheSupplierSaysNothingTheAuthenticatedNameIsShown() {
    var user = app(TestIdentities.headersWithRoles("clerk")).user();
    assertThat(user.name()).isEqualTo("test-user");
    assertThat(user.email()).isNull();
    assertThat(user.picture()).isNull();
  }
}
