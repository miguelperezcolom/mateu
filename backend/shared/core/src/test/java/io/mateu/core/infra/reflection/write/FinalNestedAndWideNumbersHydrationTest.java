package io.mateu.core.infra.reflection.write;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Two state shapes the JS client and Jackson really produce: a FINAL nested object (a form that
 * owns its sub-form instance) is updated in place from the incoming map rather than replaced, and
 * numbers Jackson reads as Long (beyond int range) or Double land in BigDecimal/float fields
 * instead of silently resetting them.
 */
class FinalNestedAndWideNumbersHydrationTest {

  public static class Address {
    public String street = "old street";
    public String city = "old city";
  }

  public static class Form {
    public final Address address = new Address();
    public BigDecimal amount = BigDecimal.ONE;
    public BigDecimal fromFloat = BigDecimal.ONE;
    public float weight = -1;
    public Float boxedWeight = -1f;
  }

  private static Form hydrated(Map<String, Object> state) {
    return Hydrater.hydrate(new Form(), new HashMap<>(state), null, null);
  }

  @Test
  void aFinalNestedObjectIsUpdatedInPlace() {
    var form = new Form();
    var before = form.address;
    var hydrated =
        Hydrater.hydrate(
            form,
            new HashMap<>(Map.of("address", Map.of("street", "Gran Via 1", "city", "Madrid"))),
            null,
            null);
    assertThat(hydrated.address).isSameAs(before);
    assertThat(hydrated.address.street).isEqualTo("Gran Via 1");
    assertThat(hydrated.address.city).isEqualTo("Madrid");
  }

  @Test
  void longAndFloatNumbersPourIntoBigDecimalAndDoublesIntoFloats() {
    var form =
        hydrated(
            Map.of(
                "amount", 5_000_000_000L, "fromFloat", 2.5f, "weight", 0.25d, "boxedWeight", 1.5d));
    assertThat(form.amount).isEqualByComparingTo("5000000000");
    assertThat(form.fromFloat).isEqualByComparingTo("2.5");
    assertThat(form.weight).isEqualTo(0.25f);
    assertThat(form.boxedWeight).isEqualTo(1.5f);
  }
}
