package io.mateu.uidl.reflection;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.GenericClass;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import org.junit.jupiter.api.Test;

/**
 * The element type of a collection field or method — what a grid field's columns, a list editor's
 * rows or a lookup's options are built from. A wrong answer is a grid with the wrong columns.
 */
class GenericClassProviderElementTest {

  record Guest(String name) {}

  record Room(int number) {}

  @SuppressWarnings("unused")
  static class Form<T> {
    List<Guest> guests;
    Map<String, Room> roomsByCode;

    @GenericClass(clazz = Room.class)
    List<Object> declaredRooms;

    List<T> generic;
    String plain;

    List<Guest> guests() {
      return guests;
    }

    String name() {
      return "";
    }
  }

  static class GuestSupplier implements Supplier<Guest> {
    @Override
    public Guest get() {
      return null;
    }
  }

  static class Plain implements Runnable {
    @Override
    public void run() {}
  }

  private static Field field(String name) throws NoSuchFieldException {
    return Form.class.getDeclaredField(name);
  }

  private static Method method(String name) throws NoSuchMethodException {
    return Form.class.getDeclaredMethod(name);
  }

  @Test
  void aCollectionFieldsElementTypeIsItsFirstTypeArgument() throws Exception {
    assertThat(GenericClassProvider.getGenericClass(field("guests").getGenericType()))
        .isEqualTo(Guest.class);
    // a type variable is not a class: nothing to build rows from
    assertThat(GenericClassProvider.getGenericClass(field("generic").getGenericType())).isNull();
    // a raw type is its own element
    assertThat(GenericClassProvider.getGenericClass(field("plain").getGenericType()))
        .isEqualTo(String.class);
  }

  @Test
  void aMethodsElementTypeIsReadOffItsReturnType() throws Exception {
    assertThat(GenericClassProvider.getGenericClass(method("guests"))).isEqualTo(Guest.class);
    assertThat(GenericClassProvider.getGenericClass(method("name"))).isEqualTo(String.class);
  }

  @Test
  void aClassIsReadOffTheFirstInterfaceItImplements() {
    assertThat(GenericClassProvider.getGenericClass(GuestSupplier.class)).isEqualTo(Guest.class);
    assertThat(GenericClassProvider.getGenericClass(Plain.class)).isEqualTo(Runnable.class);
    assertThat(GenericClassProvider.getGenericClass(Object.class)).isNull();
  }

  /** A type argument is found by its NAME in the interface it belongs to (Map's V, not K). */
  @Test
  void aNamedTypeArgumentOfAFieldIsResolvedAgainstTheInterface() throws Exception {
    assertThat(GenericClassProvider.getGenericClass(field("roomsByCode"), Map.class, "V"))
        .isEqualTo(Room.class);
    assertThat(GenericClassProvider.getGenericClass(field("roomsByCode"), Map.class, "K"))
        .isEqualTo(String.class);
    assertThat(
            GenericClassProvider.getGenericClass(
                (java.lang.reflect.ParameterizedType) field("roomsByCode").getGenericType(),
                Map.class,
                "V"))
        .isEqualTo(Room.class);
  }

  /** {@code @GenericClass} is the escape hatch when the declared type says nothing useful. */
  @Test
  void anExplicitGenericClassWinsOverTheDeclaredType() throws Exception {
    assertThat(GenericClassProvider.getGenericClass(field("declaredRooms"), List.class, "E"))
        .isEqualTo(Room.class);
    assertThat(
            GenericClassProvider.getGenericClass(
                (java.lang.reflect.AnnotatedElement) field("declaredRooms"), List.class, "E"))
        .isEqualTo(Room.class);
  }

  @Test
  void anAnnotatedElementMayBeAFieldOrAMethod() throws Exception {
    assertThat(
            GenericClassProvider.getGenericClass(
                (java.lang.reflect.AnnotatedElement) field("guests"), List.class, "E"))
        .isEqualTo(Guest.class);
    assertThat(
            GenericClassProvider.getGenericClass(
                (java.lang.reflect.AnnotatedElement) method("guests"), List.class, "E"))
        .isEqualTo(Guest.class);
  }
}
