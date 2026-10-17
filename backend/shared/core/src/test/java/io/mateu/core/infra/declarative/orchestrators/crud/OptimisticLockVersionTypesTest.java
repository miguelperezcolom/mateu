package io.mateu.core.infra.declarative.orchestrators.crud;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Version;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

/**
 * A {@code @Version} field detects a concurrent edit whatever its type: boxed integers bump and
 * compare numerically, a timestamp compares by order, any other value by equality. An unsaved
 * record or a version nobody set never conflicts, the version may live on a superclass, and an
 * explicit "overwrite" (the conflict dialog's choice, possibly sent as the text "true") adopts the
 * stored version so the next bump wins.
 */
class OptimisticLockVersionTypesTest {

  public static class Boxed {
    @Version Integer version;
  }

  public static class Base {
    @Version long version;
  }

  public static class Child extends Base {
    String name;
  }

  public static class Stamped {
    @Version LocalDateTime version;
  }

  public static class Tagged {
    @Version Object version;
  }

  public static class Unversioned {
    String name;
  }

  private static HttpRequest rq(Map<String, Object> parameters) {
    return new FakeHttpRequest(
        RunActionRqDto.builder().route("/x").actionId("save").parameters(parameters).build());
  }

  private static <T> T with(T entity, Object version) throws Exception {
    var field = OptimisticLock.versionField(entity.getClass()).orElseThrow();
    field.set(entity, version);
    return entity;
  }

  @Test
  void aBoxedIntegerVersionBumpsAndAStaleOneConflicts() throws Exception {
    var stored = with(new Boxed(), 3);
    OptimisticLock.bump(stored);
    assertThat(stored.version).isEqualTo(4);
    assertThatThrownBy(
            () -> OptimisticLock.check(with(new Boxed(), 3), Optional.of(stored), rq(Map.of())))
        .isInstanceOf(OptimisticLock.StaleEditException.class);
    OptimisticLock.check(with(new Boxed(), 4), Optional.of(stored), rq(Map.of()));
  }

  @Test
  void theVersionMayLiveOnASuperclass() throws Exception {
    var child = new Child();
    child.version = 7;
    OptimisticLock.bump(child);
    assertThat(child.version).isEqualTo(8L);
    assertThat(OptimisticLock.versionField(Child.class)).isPresent();
    assertThat(OptimisticLock.versionField(Unversioned.class)).isEmpty();
  }

  @Test
  void aTimestampVersionComparesByOrder() throws Exception {
    var now = LocalDateTime.of(2026, 10, 17, 12, 0);
    var stored = with(new Stamped(), now);
    assertThatThrownBy(
            () ->
                OptimisticLock.check(
                    with(new Stamped(), now.minusSeconds(1)), Optional.of(stored), rq(Map.of())))
        .isInstanceOf(OptimisticLock.StaleEditException.class);
    OptimisticLock.check(with(new Stamped(), now), Optional.of(stored), rq(Map.of()));
    // a timestamp is not a number: bumping leaves it to whoever stamps it
    OptimisticLock.bump(stored);
    assertThat(stored.version).isEqualTo(now);
  }

  @Test
  void anyOtherVersionConflictsWhenItDiffers() throws Exception {
    var stored = with(new Tagged(), java.util.List.of("etag-2"));
    assertThatThrownBy(
            () ->
                OptimisticLock.check(
                    with(new Tagged(), java.util.List.of("etag-1")),
                    Optional.of(stored),
                    rq(Map.of())))
        .isInstanceOf(OptimisticLock.StaleEditException.class);
    OptimisticLock.check(
        with(new Tagged(), java.util.List.of("etag-2")), Optional.of(stored), rq(Map.of()));
  }

  @Test
  void anUnsavedRecordAnUnsetVersionOrNoVersionNeverConflicts() throws Exception {
    OptimisticLock.check(with(new Boxed(), 1), Optional.empty(), rq(Map.of()));
    OptimisticLock.check(new Boxed(), Optional.of(with(new Boxed(), 9)), rq(Map.of()));
    OptimisticLock.check(with(new Boxed(), 1), Optional.of(new Boxed()), rq(Map.of()));
    OptimisticLock.check(new Unversioned(), Optional.of(new Unversioned()), rq(Map.of()));
  }

  @Test
  void overwritingAdoptsTheStoredVersionEvenWhenTheFlagTravelsAsText() throws Exception {
    var stored = with(new Boxed(), 9);
    var incoming = with(new Boxed(), 2);
    OptimisticLock.check(incoming, Optional.of(stored), rq(Map.of("_forceOverwrite", "TRUE")));
    assertThat(incoming.version).isEqualTo(9);
    var notForced = with(new Boxed(), 2);
    assertThatThrownBy(
            () ->
                OptimisticLock.check(
                    notForced, Optional.of(stored), rq(Map.of("_forceOverwrite", "no"))))
        .isInstanceOf(OptimisticLock.StaleEditException.class);
  }

  @Test
  void theConflictDialogOffersReloadAndAnOverwriteCarryingTheEditedRow() {
    var dialog =
        OptimisticLock.conflictDialog(
            "Someone saved first", "reload", "update-row", Map.of("_editedRow", Map.of("id", 1)));
    var text = dialog.toString();
    assertThat(text).contains("Someone saved first", "reload", "update-row", "_forceOverwrite");
    assertThat(text).contains("_editedRow");
  }
}
