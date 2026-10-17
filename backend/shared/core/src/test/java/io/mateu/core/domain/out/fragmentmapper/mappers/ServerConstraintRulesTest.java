package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.interfaces.ValidationSupplier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The server re-checks the same bean constraints the browser checks before running a validated
 * action, with the same semantics: {@code @Size} measures text, collections, maps and arrays;
 * {@code @Min}/{@code @Max} compare any number exactly (a BigDecimal included); {@code @Pattern}
 * must find a match; an EMPTY optional value passes them all; a field hidden by a condition and a
 * view that supplies its own validations are not second-guessed.
 */
class ServerConstraintRulesTest {

  public static class Order {
    static String CODE_PREFIX = ""; // static: never a field of the form

    @Size(min = 2, max = 5, message = "code length")
    public String code;

    @Size(min = 1, message = "at least one line")
    public List<String> lines;

    @Size(max = 1, message = "one extra at most")
    public Map<String, String> extras;

    @Size(max = 2, message = "two tags at most")
    public String[] tags;

    @Min(value = 1, message = "amount positive")
    @Max(value = 100, message = "amount capped")
    public BigDecimal amount;

    @Max(value = 10, message = "qty capped")
    public Integer qty;

    @Pattern(regexp = "^[A-Z]{3}$", message = "currency code")
    public String currency;

    @Hidden("state.internal")
    @Size(min = 3, message = "hidden by a condition")
    public String hidden = "x";
  }

  public static class SelfValidated implements ValidationSupplier {
    @Size(min = 3)
    public String code = "x";

    @Override
    public List<io.mateu.uidl.data.Validation> validations() {
      return List.of();
    }
  }

  private static List<String> violations(Order order) {
    return ServerConstraintCheck.violations(order, null, false);
  }

  @Test
  void aValidOrderAndEmptyOptionalValuesPass() {
    var order = new Order();
    order.code = "";
    order.currency = "";
    assertThat(violations(order)).isEmpty();

    order.code = "AB";
    order.lines = List.of("l1");
    order.extras = Map.of("a", "b");
    order.tags = new String[] {"x"};
    order.amount = new BigDecimal("100");
    order.qty = 10;
    order.currency = "EUR";
    assertThat(violations(order)).isEmpty();
  }

  @Test
  void eachBrokenConstraintIsReportedWithItsMessage() {
    var order = new Order();
    order.code = "TOOLONG";
    order.lines = List.of();
    order.extras = Map.of("a", "1", "b", "2");
    order.tags = new String[] {"a", "b", "c"};
    order.amount = new BigDecimal("100.01");
    order.qty = 11;
    order.currency = "eur";

    assertThat(String.join("\n", violations(order)))
        .contains(
            "code length",
            "one extra at most",
            "two tags at most",
            "amount capped",
            "qty capped",
            "currency code")
        .doesNotContain("hidden by a condition");
  }

  @Test
  void anEmptyCollectionIsPresentAndMeasured() {
    var order = new Order();
    order.lines = List.of();
    assertThat(violations(order)).anyMatch(v -> v.contains("at least one line"));
  }

  @Test
  void theMinimumComparesBigDecimalsExactly() {
    var order = new Order();
    order.amount = new BigDecimal("0.99");
    assertThat(violations(order)).anyMatch(v -> v.contains("amount positive"));
  }

  @Test
  void enforcingRefusesWithTheListOfViolations() {
    var order = new Order();
    order.qty = 99;
    assertThatThrownBy(() -> ServerConstraintCheck.enforce(order, null, false))
        .isInstanceOf(UserFacingException.class)
        .hasMessageContaining("• ")
        .hasMessageContaining("qty capped");
  }

  @Test
  void aViewThatSuppliesItsOwnValidationsIsNotSecondGuessed() {
    assertThat(ServerConstraintCheck.violations(new SelfValidated(), null, false)).isEmpty();
    assertThat(ServerConstraintCheck.violations(null, null, false)).isEmpty();
  }
}
