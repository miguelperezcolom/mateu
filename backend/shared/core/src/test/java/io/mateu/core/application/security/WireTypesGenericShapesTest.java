package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.interfaces.CrudStore;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The row-class allowlist must follow every way a view can name a type — wildcards, type variables,
 * arrays, generic arrays and member classes — or a legitimate listing whose rows are reached that
 * way is refused; and a view that only declares itself through a COMPOSED annotation or a framework
 * base class is still a view model.
 */
class WireTypesGenericShapesTest {

  public record ByWildcard(String id) {}

  public record ByBound(String id) {}

  public record ByArray(String id) {}

  public record ByGenericArray(String id) {}

  public record ByMapValue(String id) {}

  public static class Holder<T extends ByBound> {
    public T bound;
  }

  public static class Shapes {
    public List<? extends ByWildcard> wildcard;
    public Holder<ByBound> holder;
    public ByArray[] array;
    public List<ByGenericArray>[] genericArray;
    public Map<String, ByMapValue> map;

    public static class Inner {
      public String x;
    }
  }

  @Retention(RetentionPolicy.RUNTIME)
  @Label("composed")
  @interface Composed {}

  public static class ComposedOnly {
    @Composed public String name;
  }

  public static class NothingToMateu {
    public String name;
  }

  public record Product(String id, String name) implements io.mateu.uidl.interfaces.Identifiable {}

  public static class Products extends AutoCrud<Product> {
    @Override
    public CrudStore<Product> store() {
      return null;
    }
  }

  @org.springframework.stereotype.Service
  public static class ToolbarService {
    @Toolbar
    public void act() {}
  }

  @Test
  void theClosureFollowsWildcardsBoundsArraysGenericArraysAndMemberClasses() {
    assertThat(WireTypes.closure(List.of(Shapes.class)))
        .contains(
            ByWildcard.class.getName(),
            Holder.class.getName(),
            ByBound.class.getName(),
            ByArray.class.getName(),
            ByGenericArray.class.getName(),
            ByMapValue.class.getName(),
            Shapes.Inner.class.getName());
  }

  @Test
  void aComposedAnnotationOrAFrameworkBaseClassMakesAViewModel() {
    assertThat(WireTypes.isViewModelShaped(ComposedOnly.class)).isTrue();
    assertThat(WireTypes.isViewModelShaped(Products.class)).isTrue();
    assertThat(WireTypes.isViewModelShaped(NothingToMateu.class)).isFalse();
  }

  @Test
  void aServiceThatDeclaresItselfToMateuStaysInTheClosure() {
    assertThat(WireTypes.closure(List.of(ToolbarService.class)))
        .contains(ToolbarService.class.getName());
  }

  @Test
  void aRowReachedThroughAWildcardIsAcceptedAndANonsenseNameIsRefused() {
    assertThat(WireTypes.rowClass(ByWildcard.class.getName(), Shapes.class))
        .isEqualTo(ByWildcard.class);
    org.assertj.core.api.Assertions.assertThatThrownBy(
            () -> WireTypes.rowClass("x".repeat(300), Shapes.class))
        .isInstanceOf(MateuForbiddenException.class);
    org.assertj.core.api.Assertions.assertThatThrownBy(
            () -> WireTypes.rowClass(ByWildcard.class.getName(), null))
        .isInstanceOf(MateuForbiddenException.class);
  }
}
