package io.mateu.core.infra.reflection;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.ports.BeanProvider;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.Amount;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * A record-backed form is rebuilt through its canonical constructor from the JSON state the browser
 * sends, so every component type must come back typed: absent primitives are their zero, blank
 * dates and numbers are absent, enums arrive as names or as an option {value}, nested records and
 * arrays/lists/sets of them arrive as maps, a grid as a list of lists, an amount as its map — and
 * flattened {@code parent-child} keys (how nested fields travel) are folded back.
 */
class RecordStateCoercionTest {

  static class NoBeans implements BeanProvider {
    @Override
    public <T> T getBean(Class<T> clazz) {
      return null;
    }

    @Override
    public <T> java.util.Collection<T> getBeans(Class<T> clazz) {
      return List.of();
    }
  }

  public enum Status {
    OPEN,
    CLOSED
  }

  public record Line(String sku, int qty) {}

  public record Order(
      String id,
      int count,
      long big,
      float ratio,
      double total,
      boolean paid,
      Integer boxed,
      LocalDate day,
      LocalDateTime at,
      Status status,
      Status picked,
      Line main,
      Line[] lines,
      String[][] grid,
      List<Line> others,
      Set<String> tags,
      List<String> single,
      Class<?> kind,
      Amount price) {}

  public record Wrapper(String title, Line line) {}

  private final ReflectionInstanceFactory factory = new ReflectionInstanceFactory(new NoBeans());

  @Test
  @SuppressWarnings("unchecked")
  void everyComponentComesBackTypedFromTheJsonState() {
    var data = new HashMap<String, Object>();
    data.put("id", "o-1");
    data.put("count", 3);
    data.put("big", 5_000_000_000L);
    data.put("ratio", 0.5);
    data.put("total", 12.5);
    data.put("paid", true);
    data.put("boxed", 7);
    data.put("day", "2026-10-17");
    data.put("at", "2026-10-17T10:15:30");
    data.put("status", "OPEN");
    data.put("picked", Map.of("value", "CLOSED", "label", "Closed"));
    data.put("main", Map.of("sku", "A", "qty", 1));
    data.put("lines", List.of(Map.of("sku", "B", "qty", 2), Map.of("sku", "C", "qty", 3)));
    data.put("grid", List.of(List.of("a", "b"), List.of("c")));
    data.put("others", List.of(Map.of("sku", "D", "qty", 4), "raw"));
    data.put("tags", List.of("x", "y", "x"));
    data.put("single", "only");
    data.put("kind", "java.lang.String");
    data.put("price", Map.of("currency", "EUR", "value", 9, "locale", "es-ES"));

    Order order = factory.newInstance(Order.class, data, null);

    assertThat(order.id()).isEqualTo("o-1");
    assertThat(order.count()).isEqualTo(3);
    assertThat(order.big()).isEqualTo(5_000_000_000L);
    assertThat(order.ratio()).isEqualTo(0.5f);
    assertThat(order.total()).isEqualTo(12.5d);
    assertThat(order.paid()).isTrue();
    assertThat(order.boxed()).isEqualTo(7);
    assertThat(order.day()).isEqualTo(LocalDate.of(2026, 10, 17));
    assertThat(order.at()).isEqualTo(LocalDateTime.of(2026, 10, 17, 10, 15, 30));
    assertThat(order.status()).isEqualTo(Status.OPEN);
    assertThat(order.picked()).isEqualTo(Status.CLOSED);
    assertThat(order.main()).isEqualTo(new Line("A", 1));
    assertThat(order.lines()).containsExactly(new Line("B", 2), new Line("C", 3));
    assertThat(order.grid()[1]).containsExactly("c");
    assertThat((List<Object>) (List<?>) order.others()).containsExactly(new Line("D", 4), "raw");
    assertThat(order.tags()).isInstanceOf(Set.class).containsExactly("x", "y");
    assertThat(order.single()).containsExactly("only");
    assertThat(order.kind()).isEqualTo(String.class);
    assertThat(order.price()).isEqualTo(new Amount("EUR", 9d, "es-ES"));
  }

  @Test
  void absentValuesArePrimitiveZerosAndBlankValuesAreAbsent() {
    var data = new HashMap<String, Object>();
    data.put("boxed", "");
    data.put("day", "");
    data.put("at", "");
    data.put("id", "");

    Order order = factory.newInstance(Order.class, data, null);

    assertThat(order.count()).isZero();
    assertThat(order.big()).isZero();
    assertThat(order.ratio()).isZero();
    assertThat(order.total()).isZero();
    assertThat(order.paid()).isFalse();
    assertThat(order.boxed()).isNull();
    assertThat(order.day()).isNull();
    assertThat(order.at()).isNull();
    assertThat(order.id()).isEmpty(); // a String keeps what the user typed, even nothing
  }

  @Test
  void flattenedNestedKeysAreFoldedBackIntoTheNestedRecord() {
    var rq =
        RunActionRqDto.builder()
            .route("/x")
            .actionId("")
            .componentState(Map.of())
            .parameters(Map.of())
            .build();
    var data = new HashMap<String, Object>();
    data.put("title", "T");
    data.put("line-sku", "Z");
    data.put("line-qty", 9);

    var wrapper =
        (Wrapper)
            factory.createInstance(Wrapper.class.getName(), data, new FakeHttpRequest(rq)).block();

    assertThat(wrapper.title()).isEqualTo("T");
    assertThat(wrapper.line()).isEqualTo(new Line("Z", 9));
  }
}
