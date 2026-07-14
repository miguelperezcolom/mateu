package io.mateu.core.infra.declarative.orchestrators.wizard;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import java.util.concurrent.Callable;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;

/**
 * Wizard steps commonly carry Callable&lt;Component&gt; header/content holders (see the
 * demo-front-office check-in steps). They must be skipped from the wizard state without
 * requiring @JsonIgnore — before the fix the serializer even INVOKED the holder and merged the
 * built component's fields into the state unprefixed.
 */
class WizardStateSerializerHolderFieldsTest {

  @SuppressWarnings("unused")
  static class StepLike {
    String guestId = "g1";
    String documento = "12345678Z";

    Callable<Component> header = () -> new Text("header content");
    Supplier<Component> extras = () -> new Text("extras content");
    Component banner = new Text("banner content");
  }

  @Test
  void holderFieldsAreSkippedFromTheWizardState() {
    var map = WizardStateSerializer.toMap(new StepLike());
    assertThat(map).containsEntry("guestId", "g1");
    assertThat(map).containsEntry("documento", "12345678Z");
    assertThat(map).doesNotContainKeys("header", "extras", "banner");
    // no unprefixed leakage of the built components' fields (Text has a "text" field)
    assertThat(map).doesNotContainKey("text");
  }
}
