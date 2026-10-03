package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;

import io.mateu.core.domain.ports.InstanceFactory;
import io.mateu.core.infra.reflection.write.Hydrater;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** The static rules behind the wire-type allowlist and the action recognition. */
class WireTypesTest {

  // ── fixtures ──────────────────────────────────────────────────────────────

  public record Row(String id, String name) {}

  public record Unrelated(String id) {}

  public static class Service {
    public void deleteAll() {}
  }

  public static class Form {
    public List<Row> rows;
    public Nested nested;
    @jakarta.inject.Inject Service service;
    static Unrelated sharedStatic;

    @Button
    public Detail open() {
      return null;
    }
  }

  public static class Nested {
    public String street;
  }

  public static class Detail {
    @Label("x")
    public String x;
  }

  public abstract static class Base {}

  @org.springframework.stereotype.Service
  public static class AnnotatedService {
    public String state;
  }

  public static class Plain {
    public String value;
  }

  public static class Annotated {
    @Label("Name")
    public String name;
  }

  public abstract static class RowsListing implements Listing<Row> {}

  public static class Actions {
    @Button
    void marked() {}

    public void publicConvention() {}

    void packagePrivate() {}

    void rowAction(Row row, HttpRequest httpRequest) {}

    void selectedRows(List<Row> rows) {}

    private void hidden() {}

    public String getName() {
      return "";
    }

    public void setName(String name) {}

    @Override
    public String toString() {
      return "";
    }

    @ListToolbarButton
    protected void bulk() {}

    public static void utility() {}
  }

  public record RecordView(String name) {
    public void act() {}
  }

  // ── closure ─────────────────────────────────────────────────────────────────

  @Test
  void theClosureFollowsFieldsRowsAndAnnotatedReturnTypes() {
    var closure = WireTypes.closure(List.of(Form.class));

    assertThat(closure)
        .contains(
            Form.class.getName(),
            Row.class.getName(),
            Nested.class.getName(),
            Detail.class.getName())
        .doesNotContain(
            Service.class.getName(), // injected dependency
            Unrelated.class.getName(), // static field
            "java.lang.String",
            "java.util.List");
  }

  @Test
  void theClosureIncludesTheGenericArgumentsOfSupertypes() {
    assertThat(WireTypes.closure(List.of(RowsListing.class))).contains(Row.class.getName());
  }

  @Test
  void theClosureNeverIncludesInterfacesOrAbstractClasses() {
    var closure = WireTypes.closure(List.of(Base.class, Listing.class));
    assertThat(closure).doesNotContain(Base.class.getName(), Listing.class.getName());
  }

  // ── shape ───────────────────────────────────────────────────────────────────

  @Test
  void onlyClassesThatDeclareThemselvesToMateuAreViewModelShaped() {
    assertThat(WireTypes.isViewModelShaped(Annotated.class)).isTrue();
    assertThat(WireTypes.isViewModelShaped(Form.class)).isTrue();
    assertThat(WireTypes.isViewModelShaped(Plain.class)).isFalse();
    assertThat(WireTypes.isViewModelShaped(Service.class)).isFalse();
    assertThat(WireTypes.isViewModelShaped(RowsListing.class)).isFalse(); // abstract
    assertThat(WireTypes.isViewModelShaped(String.class)).isFalse();
    assertThat(WireTypes.isViewModelShaped(WireTypes.class)).isFalse(); // the kernel itself
  }

  @Test
  void serviceStereotypesAreRecognised() {
    assertThat(WireTypes.isServiceStereotyped(AnnotatedService.class)).isTrue();
    assertThat(WireTypes.isServiceStereotyped(Plain.class)).isFalse();
  }

  @Test
  void namesAreValidatedBeforeAnyLoading() {
    assertThat(WireTypes.isBinaryName("com.example.Foo$Bar")).isTrue();
    assertThat(WireTypes.isBinaryName("../etc/passwd")).isFalse();
    assertThat(WireTypes.isBinaryName("a b")).isFalse();
    assertThat(WireTypes.isBinaryName(null)).isFalse();
    assertThat(WireTypes.loadWithoutInit("com.example.DoesNotExist")).isNull();
  }

  // ── row classes ─────────────────────────────────────────────────────────────

  @Test
  void aRowClassMustBeReachableFromItsOwnerOrEmitted() {
    assertThat(WireTypes.rowClass(Row.class.getName(), Form.class)).isEqualTo(Row.class);
    assertThatThrownBy(() -> WireTypes.rowClass(Unrelated.class.getName(), Form.class))
        .isInstanceOf(MateuForbiddenException.class);
    assertThatThrownBy(() -> WireTypes.rowClass("java.lang.Runtime", Form.class))
        .isInstanceOf(MateuForbiddenException.class);
    assertThatThrownBy(() -> WireTypes.rowClass(Plain.class.getName(), null))
        .isInstanceOf(MateuForbiddenException.class);

    WireTypes.emitted(Plain.class.getName());
    assertThat(WireTypes.rowClass(Plain.class.getName(), null)).isEqualTo(Plain.class);
  }

  // ── action recognition ──────────────────────────────────────────────────────

  private static boolean invocable(String name) throws Exception {
    for (var m : Actions.class.getDeclaredMethods()) {
      if (m.getName().equals(name)) {
        return ActionMethods.isInvocable(m, Actions.class);
      }
    }
    throw new AssertionError("no method " + name);
  }

  @Test
  void actionsAreMarkedMethodsPublicMethodsAndRowMethods() throws Exception {
    assertThat(invocable("marked")).isTrue();
    assertThat(invocable("bulk")).isTrue();
    assertThat(invocable("publicConvention")).isTrue();
    assertThat(invocable("rowAction")).isTrue();
    assertThat(invocable("selectedRows")).isTrue();

    assertThat(invocable("packagePrivate")).isFalse();
    assertThat(invocable("hidden")).isFalse();
    assertThat(invocable("getName")).isFalse();
    assertThat(invocable("setName")).isFalse();
    assertThat(invocable("toString")).isFalse();
    assertThat(invocable("utility")).isFalse();
    assertThat(ActionMethods.isInvocable(Object.class.getMethod("hashCode"), Actions.class))
        .isFalse();
    assertThat(ActionMethods.isInvocable(null, Actions.class)).isFalse();
  }

  @Test
  void recordAccessorsAreNotActions() throws Exception {
    assertThat(ActionMethods.isInvocable(RecordView.class.getMethod("name"), RecordView.class))
        .isFalse();
    assertThat(ActionMethods.isInvocable(RecordView.class.getMethod("act"), RecordView.class))
        .isTrue();
  }

  @Test
  void findingANonActionByNameIsARefusalAndAnUnknownNameIsNothing() {
    assertThat(ActionMethods.findInvocable(Actions.class, "marked")).isNotNull();
    assertThat(ActionMethods.findInvocable(Actions.class, "noSuchMethod")).isNull();
    assertThatThrownBy(() -> ActionMethods.findInvocable(Actions.class, "hidden"))
        .isInstanceOf(MateuForbiddenException.class);
    assertThatThrownBy(() -> ActionMethods.findInvocable(Actions.class, "wait"))
        .isInstanceOf(MateuForbiddenException.class);
  }

  @Test
  void fieldActionsAreMarkedOrFunctionalFields() throws Exception {
    class Holder {
      @Button String marked;
      Runnable run = () -> {};
      String plain;
      @jakarta.inject.Inject Runnable injected;
      static Runnable shared = () -> {};
    }
    assertThat(ActionMethods.isInvocable(Holder.class.getDeclaredField("marked"))).isTrue();
    assertThat(ActionMethods.isInvocable(Holder.class.getDeclaredField("run"))).isTrue();
    assertThat(ActionMethods.isInvocable(Holder.class.getDeclaredField("plain"))).isFalse();
    assertThat(ActionMethods.isInvocable(Holder.class.getDeclaredField("injected"))).isFalse();
    assertThat(ActionMethods.isInvocable(Holder.class.getDeclaredField("shared"))).isFalse();
    assertThat(ActionMethods.isInvocable((java.lang.reflect.Field) null)).isFalse();
  }

  // ── hydration ───────────────────────────────────────────────────────────────

  public static class WithDependency {
    public String name;
    @jakarta.inject.Inject public Service service = new Service();
  }

  @Test
  void wireStateNeverOverwritesAnInjectedDependency() {
    var target = new WithDependency();
    var original = target.service;

    Hydrater.hydrate(
        target,
        Map.of("name", "Alice", "service", Map.of()),
        mock(InstanceFactory.class),
        mock(HttpRequest.class));

    assertThat(target.name).isEqualTo("Alice");
    assertThat(target.service).isSameAs(original);
  }

  @Test
  void theForbiddenExceptionIsFoundInACauseChain() {
    var forbidden = new MateuForbiddenException("x");
    assertThat(MateuForbiddenException.find(new RuntimeException(forbidden))).isSameAs(forbidden);
    assertThat(MateuForbiddenException.find(new RuntimeException("other"))).isNull();
    assertThat(forbidden.status()).isEqualTo(403);
    assertThat(MateuForbiddenException.publicMessage()).isEqualTo("Forbidden");
  }
}
