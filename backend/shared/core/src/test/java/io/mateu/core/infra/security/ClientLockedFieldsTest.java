package io.mateu.core.infra.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.PartialRegistry;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.Partial;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/** What {@link ClientLockedFields} derives from the YAML pieces' definitions, without rendering. */
class ClientLockedFieldsTest {

  @TempDir Path dir;

  @AfterEach
  void forget() {
    PartialRegistry.instance().reset();
    ClientLockedFields.reset();
  }

  private static HttpRequest guest() {
    return new FakeHttpRequest(RunActionRqDto.builder().route("/").build());
  }

  private static HttpRequest hr() {
    return new FakeHttpRequest(RunActionRqDto.builder().route("/").build())
        .withPrincipal(TestIdentities.principalWithRoles("hr"));
  }

  private <T> T over(Map<String, String> files, Supplier<T> body) {
    return SpecsDir.over(
        SpecsDir.write(dir, files),
        cl -> {
          PartialRegistry.instance().reset();
          ClientLockedFields.reset();
          return body.get();
        });
  }

  private static final Map<String, String> NESTED =
      Map.of(
          "partials/outer.yaml",
          """
          content:
            - type: FormField
              id: visible
              label: Visible
              dataType: string
            - type: VerticalLayout
              eyesOnly: {roles: [hr]}
              content:
                - type: Partial
                  ref: inner
          """,
          "partials/inner.yaml",
          """
          type: FormField
          id: secretCode
          label: Secret code
          dataType: string
          """);

  @Test
  void aPlainPartialNestedUnderASectionTheCallerMayNotSeeLocksAllItsFields() {
    var locked =
        over(NESTED, () -> ClientLockedFields.lockedByPiecesOf(new Partial("outer"), guest()));
    assertThat(locked).containsExactly("secretCode");
  }

  @Test
  void aCallerWhoMaySeeTheSectionWritesTheNestedPartialsFields() {
    var locked =
        over(NESTED, () -> ClientLockedFields.lockedByPiecesOf(new Partial("outer"), hr()));
    assertThat(locked).isEmpty();
  }

  public static class DrawsAPartial implements ComponentTreeSupplier {
    public String secretCode;

    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(List.of(new Partial("outer")));
    }
  }

  public static class DrawsNothing implements ComponentTreeSupplier {
    public String secretCode;

    @Override
    public Component component(HttpRequest httpRequest) {
      return new Text("nothing");
    }
  }

  public static class PlainForm {
    public String secretCode;
  }

  @Test
  void aViewNotRenderedYetIsCheckedAgainstEveryPieceOfTheApp() {
    var locked = over(NESTED, () -> ClientLockedFields.lockedFor(DrawsNothing.class, guest()));
    assertThat(locked).contains("secretCode");
  }

  /**
   * STRICT: what a view drew before never narrows the check — a page may draw a piece only in some
   * state, so every view that may draw pieces is checked against every piece, every time.
   */
  @Test
  void everyViewThatMayDrawPiecesIsCheckedAgainstEveryPieceWhateverItRendered() {
    var locked =
        over(
            NESTED,
            () ->
                List.of(
                    ClientLockedFields.lockedFor(DrawsNothing.class, guest()),
                    ClientLockedFields.lockedFor(DrawsAPartial.class, guest()),
                    ClientLockedFields.lockedFor(DrawsNothing.class, guest())));
    assertThat(locked.get(0)).containsExactly("secretCode");
    assertThat(locked.get(1)).containsExactly("secretCode");
    assertThat(locked.get(2)).containsExactly("secretCode");
  }

  /** The app-wide set is cached per caller identity: another identity gets its own answer. */
  @Test
  void theAppWideSetIsPerCallerIdentity() {
    var locked =
        over(
            NESTED,
            () ->
                List.of(
                    ClientLockedFields.appWideLockedFor(guest()),
                    ClientLockedFields.appWideLockedFor(hr()),
                    ClientLockedFields.appWideLockedFor(guest())));
    assertThat(locked.get(0)).containsOnlyKeys("secretCode");
    assertThat(locked.get(0).get("secretCode")).contains("inner");
    assertThat(locked.get(1)).isEmpty();
    assertThat(locked.get(2)).isEqualTo(locked.get(0));
  }

  public static class HasAMethodReturningComponents {
    public String secretCode;

    public List<Component> overview() {
      return List.of(new Partial("outer"));
    }
  }

  @Test
  void aClassWithAMethodReturningComponentsMayDrawPieces() {
    var locked =
        over(
            NESTED,
            () -> ClientLockedFields.lockedFor(HasAMethodReturningComponents.class, guest()));
    assertThat(locked).containsExactly("secretCode");
  }

  @Test
  void aPlainFormThatCannotDrawPiecesIsLeftAlone() {
    var locked = over(NESTED, () -> ClientLockedFields.lockedFor(PlainForm.class, guest()));
    assertThat(locked).isEmpty();
  }

  @Test
  void anAppWhoseSpecsDeclareNoAccessKeysLocksNothing() {
    var locked =
        over(
            Map.of("partials/inner.yaml", NESTED.get("partials/inner.yaml")),
            () -> ClientLockedFields.lockedFor(DrawsAPartial.class, guest()));
    assertThat(locked).isEmpty();
  }

  /**
   * A caller whose identity cannot be read is nobody: the pieces lock for it what they lock for an
   * anonymous caller, never less.
   */
  static final class Unreadable extends FakeHttpRequest {
    Unreadable() {
      super(RunActionRqDto.builder().route("/").build());
    }

    @Override
    public java.security.Principal getUserPrincipal() {
      throw new IllegalStateException("identity backend down");
    }
  }

  @Test
  void aCallerWhoseIdentityCannotBeReadWritesNoLockedField() {
    Set<String> locked =
        over(
            NESTED,
            () -> ClientLockedFields.lockedByPiecesOf(new Partial("outer"), new Unreadable()));
    assertThat(locked).contains("secretCode");
  }

  @Test
  void droppingLeavesTheOtherKeysAndTheSameMapWhenNothingIsLocked() {
    Map<String, Object> state = Map.of("a", 1, "b", 2);
    assertThat(ClientLockedFields.without("X", state, Set.of())).isSameAs(state);
    assertThat(ClientLockedFields.without("X", state, Set.of("b"))).containsOnlyKeys("a");
  }
}
