package io.mateu.core.domain.reflection;

import static io.mateu.core.infra.reflection.read.AllEditableFieldsProvider.getAllEditableFields;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllFormFieldsProvider.getAllFormFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.GetterProvider.getGetter;
import static io.mateu.core.infra.reflection.read.SetterProvider.getSetter;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.forms.SimpleForm;
import io.mateu.core.infra.FakeBeanProvider;
import io.mateu.core.infra.reflection.read.FileChecker;
import io.mateu.core.infra.reflection.read.ValueProvider;
import io.mateu.uidl.annotations.ReadOnly;
import org.junit.jupiter.api.Test;

class ReflectionReadTest {

  public static class Parent {
    public String parentField = "parent";
    public String getParentField() { return parentField; }
    public void parentMethod() {}
  }

  public static class Child extends Parent {
    public String childField = "child";
    public int intField = 42;
    public boolean boolField = true;
    @ReadOnly public String readOnlyField = "ro";
    public String getChildField() { return childField; }
    public void childMethod() {}
  }

  // --- AllFieldsProvider ---

  @Test
  void getAllFieldsIncludesInheritedFields() {
    var names = getAllFields(Child.class).stream().map(f -> f.getName()).toList();
    assertThat(names).contains("childField", "parentField");
  }

  @Test
  void getAllFieldsForObject() {
    assertThat(getAllFields(Object.class)).isEmpty();
  }

  // --- AllMethodsProvider ---

  @Test
  void getAllMethodsIncludesInheritedMethods() {
    var names = getAllMethods(Child.class).stream().map(m -> m.getName()).toList();
    assertThat(names).contains("childMethod", "parentMethod");
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
    assertNotNull(getFieldByName(Child.class, "parentField"));
  }

  @Test
  void getFieldByNameReturnsNullForMissing() {
    assertNull(getFieldByName(Child.class, "nonExistent"));
  }

  // --- GetterProvider ---

  @Test
  void getGetterForStringField() throws NoSuchFieldException {
    var field = Child.class.getDeclaredField("childField");
    assertThat(getGetter(field)).isEqualTo("getChildField");
  }

  @Test
  void getGetterForBooleanField() throws NoSuchFieldException {
    var field = Child.class.getDeclaredField("boolField");
    assertThat(getGetter(field)).isEqualTo("isBoolField");
  }

  // --- SetterProvider ---

  @Test
  void getSetterForFieldContainsFieldName() {
    // getSetter(Field) returns "set" + capitalizedFieldName
    var setter = getSetter(getFieldByName(Child.class, "childField"));
    assertThat(setter).isEqualTo("setChildField");
  }

  @Test
  void getSetterByClassName() {
    assertThat(getSetter(Child.class, "childField")).isEqualTo("setChildField");
  }

  // --- ValueProvider ---

  @Test
  void getValueFromPublicField() {
    var child = new Child();
    var field = getFieldByName(Child.class, "childField");
    assertEquals("child", getValue(field, child));
  }

  @Test
  void getValueOrNewInstanceReturnsExistingValue() {
    var child = new Child();
    var field = getFieldByName(Child.class, "childField");
    assertEquals("child", ValueProvider.getValueOrNewInstance(new FakeBeanProvider(), field, child));
  }

  // --- AllEditableFieldsProvider ---

  @Test
  void getAllEditableFieldsExcludesReadOnly() {
    var names = getAllEditableFields(Child.class).stream().map(f -> f.getName()).toList();
    // Should have editable fields
    assertThat(names).isNotEmpty();
    // readOnlyField should not appear since it has @ReadOnly
    assertThat(names).doesNotContain("readOnlyField");
  }

  // --- AllFormFieldsProvider ---

  @Test
  void getAllFormFieldsReturnsMembers() {
    assertThat(getAllFormFields(SimpleForm.class)).isNotEmpty();
  }

  // --- FileChecker ---

  @Test
  void isFileReturnsFalseForStringField() throws NoSuchFieldException {
    var field = Child.class.getDeclaredField("childField");
    assertThat(FileChecker.isFile(field)).isFalse();
  }

  @Test
  void isFileReturnsTrueForFileField() throws NoSuchFieldException {
    class WithFileField { java.io.File file; }
    var field = WithFileField.class.getDeclaredField("file");
    assertThat(FileChecker.isFile(field)).isTrue();
  }
}
