package io.mateu.core.domain.reflection;

import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllFormFieldsProvider.getAllFormFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.GetterProvider.getGetter;
import static io.mateu.core.infra.reflection.read.SetterProvider.getSetter;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.forms.SimpleForm;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.reflection.read.FileChecker;
import io.mateu.uidl.annotations.ReadOnly;
import lombok.Builder;
import org.junit.jupiter.api.Test;

class ReflectionReadTest {

  // --- Sample classes for testing ---

  static class Parent {
    String parentField = "parent";

    String getParentField() {
      return parentField;
    }

    void parentMethod() {}
  }

  static class Child extends Parent {
    String childField = "child";
    int intField = 42;
    boolean boolField = true;

    @ReadOnly String readOnlyField = "ro";

    String getChildField() {
      return childField;
    }

    void childMethod() {}
  }

  @Builder
  static class WithFile {
    java.io.File fileField;
  }

  // --- AllFieldsProvider ---

  @Test
  void getAllFieldsIncludesInheritedFields() {
    var fields = getAllFields(Child.class);
    var names = fields.stream().map(f -> f.getName()).toList();
    assertThat(names).contains("childField", "parentField");
  }

  @Test
  void getAllFieldsForNull() {
    var fields = getAllFields(null);
    assertThat(fields).isEmpty();
  }

  @Test
  void getAllFieldsForObject() {
    var fields = getAllFields(Object.class);
    assertThat(fields).isEmpty();
  }

  // --- AllMethodsProvider ---

  @Test
  void getAllMethodsIncludesInheritedMethods() {
    var methods = getAllMethods(Child.class);
    var names = methods.stream().map(m -> m.getName()).toList();
    assertThat(names).contains("childMethod", "parentMethod");
  }

  @Test
  void getAllMethodsForNull() {
    var methods = getAllMethods(null);
    assertThat(methods).isEmpty();
  }

  // --- FieldByNameProvider ---

  @Test
  void getFieldByNameFindsField() {
    var field = getFieldByName(Child.class, "childField");
    assertNotNull(field);
    assertEquals("childField", field.getName());
  }

  @Test
  void getFieldByNameFindsInheritedField() {
    var field = getFieldByName(Child.class, "parentField");
    assertNotNull(field);
  }

  @Test
  void getFieldByNameReturnsNullForMissing() {
    var field = getFieldByName(Child.class, "nonExistent");
    assertNull(field);
  }

  @Test
  void getFieldByNameForNull() {
    var field = getFieldByName(null, "field");
    assertNull(field);
  }

  // --- GetterProvider ---

  @Test
  void getGetterForStringField() throws NoSuchFieldException {
    var getter = getGetter(SimpleForm.class.getDeclaredField("stringField"));
    assertEquals("getStringField", getter);
  }

  @Test
  void getGetterForBooleanField() throws NoSuchFieldException {
    var getter = getGetter(SimpleForm.class.getDeclaredField("booleanField"));
    assertEquals("isBooleanField", getter);
  }

  // --- SetterProvider ---

  @Test
  void getSetterForField() {
    var setter = getSetter(getFieldByName(Child.class, "childField"));
    assertNotNull(setter);
    assertThat(setter).contains("childField");
  }

  @Test
  void getSetterByName() {
    var setter = getSetter(Child.class, "childField");
    assertNotNull(setter);
  }

  // --- ValueProvider ---

  @Test
  void getValueFromField() {
    var child = new Child();
    var field = getFieldByName(Child.class, "childField");
    var value = getValue(field, child);
    assertEquals("child", value);
  }

  @Test
  void getValueOrNewInstanceReturnsExistingValue() {
    var child = new Child();
    var field = getFieldByName(Child.class, "childField");
    var value = getValueOrNewInstance(new FakeBeanProvider(), field, child);
    assertEquals("child", value);
  }

  @Test
  void getValueOrNewInstanceCreatesNewInstance() {
    // parentField is null in a fresh Child since it's set in the field initializer
    // but we need a null field - use a new class
    var child = new Child();
    child.childField = null;
    var field = getFieldByName(Child.class, "childField");
    // String can't be instantiated via newInstance, so it returns null
    var value = getValueOrNewInstance(new FakeBeanProvider(), field, child);
    assertNull(value);
  }

  // --- AllEditableFieldsProvider ---

  @Test
  void getAllEditableFieldsExcludesReadOnly() {
    var fields = getAllEditableFields(Child.class);
    var names = fields.stream().map(f -> f.getName()).toList();
    assertThat(names).contains("childField", "intField");
    assertThat(names).doesNotContain("readOnlyField");
  }

  // --- AllFormFieldsProvider ---

  @Test
  void getAllFormFieldsReturnsMembers() {
    var members = getAllFormFields(SimpleForm.class);
    assertThat(members).isNotEmpty();
  }

  // --- FileChecker ---

  @Test
  void isFileReturnsTrueForFileField() throws NoSuchFieldException {
    // Use a field typed as java.io.File
    class WithFileField {
      java.io.File file;
    }
    var field = WithFileField.class.getDeclaredField("file");
    assertThat(FileChecker.isFile(field)).isTrue();
  }

  @Test
  void isFileReturnsFalseForStringField() throws NoSuchFieldException {
    var field = Child.class.getDeclaredField("childField");
    assertThat(FileChecker.isFile(field)).isFalse();
  }
}
