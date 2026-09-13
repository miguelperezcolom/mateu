package io.mateu.core.infra.reflection;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.ports.BeanProvider;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;

/**
 * A {@code Set<Enum>} filter field is reconstructed from a hydrated Set, not cast to List.
 *
 * <p>Regression: a multi-select filter (e.g. a process listing's {@code Set<ProcessStatus> status})
 * arrives as a {@code LinkedHashSet} that FilterStateAssembler already hydrated. The reflection
 * type coercer assumed the collection value was always a {@code List} and always produced an {@code
 * ArrayList}, so reconstructing the record threw {@code ClassCastException: LinkedHashSet cannot be
 * cast to List} and every search on such a listing failed. It must accept a Set source and produce
 * the Set the field declares.
 */
class SetFilterCoercionTest {

  enum Colour {
    RED,
    GREEN,
    BLUE
  }

  /** A filters record shaped like the real listing filters: a multi-select over an enum. */
  public record Filters(Set<Colour> colours) {}

  /** A list-typed field must still come back as a List. */
  public record ListFilters(List<Colour> colours) {}

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

  @Test
  void reconstructsASetEnumFieldFromAHydratedSet() {
    var factory = new ReflectionInstanceFactory(new NoBeans());
    Map<String, Object> state =
        Map.of("colours", new LinkedHashSet<>(List.of(Colour.RED, Colour.BLUE)));

    Filters filters = factory.newInstance(Filters.class, state, null);

    assertThat(filters.colours()).isInstanceOf(Set.class);
    assertThat(filters.colours()).containsExactlyInAnyOrder(Colour.RED, Colour.BLUE);
  }

  @Test
  void stillReconstructsASetEnumFieldFromAListSource() {
    var factory = new ReflectionInstanceFactory(new NoBeans());
    Map<String, Object> state = Map.of("colours", List.of(Colour.GREEN));

    Filters filters = factory.newInstance(Filters.class, state, null);

    assertThat(filters.colours()).containsExactly(Colour.GREEN);
  }

  @Test
  void aListFieldStillComesBackAsAList() {
    var factory = new ReflectionInstanceFactory(new NoBeans());
    Map<String, Object> state = Map.of("colours", List.of(Colour.RED, Colour.GREEN));

    ListFilters filters = factory.newInstance(ListFilters.class, state, null);

    assertThat(filters.colours()).isInstanceOf(List.class);
    assertThat(filters.colours()).containsExactly(Colour.RED, Colour.GREEN);
  }
}
