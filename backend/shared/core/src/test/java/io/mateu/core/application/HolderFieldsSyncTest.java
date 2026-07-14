package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.FormViewModel;
import io.mateu.core.infra.reflection.read.AllEditableFieldsProvider;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Holder fields (Callable/Supplier/fluent Component) are UI, not data: the state serializer skips
 * them and hydration leaves them untouched, WITHOUT the developer marking them @JsonIgnore.
 * Regression for the demo-front-office check-in steps, where the state carried the holders'
 * Jackson-serialized husks ({}), rehydration wrote null over the field initializers, and the next
 * render NPEd in ReflectionFormFieldMapper.
 */
class HolderFieldsSyncTest {

  @SuppressWarnings("unused")
  @UI("/holder-fields")
  public static class HolderForm {
    String name = "Ada";

    Callable<Component> lazy = () -> new Text("lazy content");

    Component banner = new Text("banner content");

    final String finalCode = "C-1";

    static HolderForm seen;

    @Action
    void snapshot(HttpRequest httpRequest) {
      seen = this;
    }
  }

  @SuppressWarnings("unused")
  static class SupplierHolder {
    String label = "l1";
    Supplier<Component> supplied = () -> new Text("supplied content");
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(HolderForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private void run(Map<String, Object> state) {
    mateu.run(
        RunActionRqDto.builder()
            .route("/holder-fields")
            .actionId("snapshot")
            .serverSideType(HolderForm.class.getName())
            .componentState(state)
            .initiatorComponentId("hf_app")
            .build());
  }

  // ── serialization: holder fields never enter the state ─────────────────────

  @Test
  void stateOmitsHolderFieldsButTheyStillRender() {
    var increment = mateu.sync("/holder-fields");
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) increment.fragments().get(0).state();
    assertThat(state).containsEntry("name", "Ada");
    assertThat(state).doesNotContainKeys("lazy", "banner");
    // and no leaked entries from recursing into the built components
    assertThat(state.keySet())
        .noneMatch(key -> key.startsWith("lazy-") || key.startsWith("banner-"));
  }

  @Test
  void supplierFieldsAreSkippedBySerializationToo() {
    var map = FormViewModel.toMap(new SupplierHolder());
    assertThat(map).containsEntry("label", "l1");
    assertThat(map).doesNotContainKey("supplied");
    assertThat(map.keySet()).noneMatch(key -> key.startsWith("supplied"));
  }

  // ── rehydration: holder initializers survive the round trip ─────────────────

  @Test
  void hydrationPreservesHolderInitializersEvenWhenAClientEchoesThem() throws Exception {
    HolderForm.seen = null;
    var state = new HashMap<String, Object>();
    state.put("name", "Eva");
    // a stale client may still echo holder entries (Jackson used to serialize lambdas as {})
    state.put("lazy", new HashMap<String, Object>());
    state.put("banner", new HashMap<String, Object>());
    run(state);
    assertThat(HolderForm.seen).isNotNull();
    assertThat(HolderForm.seen.name).isEqualTo("Eva");
    // before the fix hydration nulled these and the following render NPEd
    assertThat(HolderForm.seen.lazy).isNotNull();
    assertThat(HolderForm.seen.lazy.call()).isNotNull();
    assertThat(HolderForm.seen.banner).isNotNull();
  }

  @Test
  void actionRoundTripWithoutHolderEntriesAlsoPreservesThem() {
    HolderForm.seen = null;
    var state = new HashMap<String, Object>();
    state.put("name", "Iris");
    run(state);
    assertThat(HolderForm.seen).isNotNull();
    assertThat(HolderForm.seen.lazy).isNotNull();
    assertThat(HolderForm.seen.banner).isNotNull();
  }

  // ── final fields are dropped from the editable set (now with a warning) ─────

  @Test
  void finalFieldsAreDroppedFromEditableFields() {
    var editable =
        AllEditableFieldsProvider.getAllEditableFields(HolderForm.class).stream()
            .map(Field::getName)
            .toList();
    assertThat(editable).contains("name");
    assertThat(editable).doesNotContain("finalCode");
  }
}
