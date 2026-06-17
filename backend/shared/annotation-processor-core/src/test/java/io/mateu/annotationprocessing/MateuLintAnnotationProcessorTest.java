package io.mateu.annotationprocessing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import io.mateu.uidl.annotations.*;
import java.util.List;
import java.util.Set;
import javax.annotation.processing.Messager;
import javax.annotation.processing.ProcessingEnvironment;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.Name;
import javax.lang.model.element.TypeElement;
import javax.tools.Diagnostic.Kind;
import org.junit.Test;

public class MateuLintAnnotationProcessorTest {

  private record LintContext(MateuLintAnnotationProcessor processor, Messager messager) {}

  private LintContext buildContext() {
    var processor = new MateuLintAnnotationProcessor();
    var processingEnv = mock(ProcessingEnvironment.class);
    var messager = mock(Messager.class);
    when(processingEnv.getMessager()).thenReturn(messager);
    processor.init(processingEnv);
    return new LintContext(processor, messager);
  }

  // ---------------------------------------------------------------------------
  // checkHiddenCombinations
  // ---------------------------------------------------------------------------

  @Test
  public void unconditionalHiddenPlusHiddenInList_isError() {
    var ctx = buildContext();
    var field = mock(Element.class);
    var hidden = mock(Hidden.class);
    when(hidden.value()).thenReturn("");
    when(field.getAnnotation(Hidden.class)).thenReturn(hidden);
    when(field.getAnnotation(HiddenInList.class)).thenReturn(mock(HiddenInList.class));

    ctx.processor().checkHiddenCombinations(field);

    verify(ctx.messager()).printMessage(eq(Kind.ERROR), contains("HiddenInList"), eq(field));
  }

  @Test
  public void unconditionalHiddenPlusHiddenInCreate_isError() {
    var ctx = buildContext();
    var field = mock(Element.class);
    var hidden = mock(Hidden.class);
    when(hidden.value()).thenReturn("");
    when(field.getAnnotation(Hidden.class)).thenReturn(hidden);
    when(field.getAnnotation(HiddenInCreate.class)).thenReturn(mock(HiddenInCreate.class));

    ctx.processor().checkHiddenCombinations(field);

    verify(ctx.messager()).printMessage(eq(Kind.ERROR), contains("HiddenInCreate"), eq(field));
  }

  @Test
  public void conditionalHiddenPlusHiddenInList_isNotError() {
    var ctx = buildContext();
    var field = mock(Element.class);
    var hidden = mock(Hidden.class);
    when(hidden.value()).thenReturn("someExpression");
    when(field.getAnnotation(Hidden.class)).thenReturn(hidden);
    when(field.getAnnotation(HiddenInList.class)).thenReturn(mock(HiddenInList.class));

    ctx.processor().checkHiddenCombinations(field);

    verify(ctx.messager(), never()).printMessage(any(), any(), any());
  }

  @Test
  public void unconditionalHiddenAloneIsOk() {
    var ctx = buildContext();
    var field = mock(Element.class);
    var hidden = mock(Hidden.class);
    when(hidden.value()).thenReturn("");
    when(field.getAnnotation(Hidden.class)).thenReturn(hidden);
    when(field.getAnnotation(HiddenInList.class)).thenReturn(null);
    when(field.getAnnotation(HiddenInCreate.class)).thenReturn(null);
    when(field.getAnnotation(HiddenInEditor.class)).thenReturn(null);
    when(field.getAnnotation(HiddenInView.class)).thenReturn(null);

    ctx.processor().checkHiddenCombinations(field);

    verify(ctx.messager(), never()).printMessage(any(), any(), any());
  }

  @Test
  public void noHiddenAnnotation_isNotError() {
    var ctx = buildContext();
    var field = mock(Element.class);
    when(field.getAnnotation(Hidden.class)).thenReturn(null);

    ctx.processor().checkHiddenCombinations(field);

    verify(ctx.messager(), never()).printMessage(any(), any(), any());
  }

  // ---------------------------------------------------------------------------
  // checkReadOnlyConflict
  // ---------------------------------------------------------------------------

  @Test
  public void readOnlyPlusEditableOnlyWhenCreating_isError() {
    var ctx = buildContext();
    var field = mock(Element.class);
    when(field.getAnnotation(ReadOnly.class)).thenReturn(mock(ReadOnly.class));
    when(field.getAnnotation(EditableOnlyWhenCreating.class))
        .thenReturn(mock(EditableOnlyWhenCreating.class));

    ctx.processor().checkReadOnlyConflict(field);

    verify(ctx.messager()).printMessage(eq(Kind.ERROR), any(), eq(field));
  }

  @Test
  public void readOnlyAlone_isOk() {
    var ctx = buildContext();
    var field = mock(Element.class);
    when(field.getAnnotation(ReadOnly.class)).thenReturn(mock(ReadOnly.class));
    when(field.getAnnotation(EditableOnlyWhenCreating.class)).thenReturn(null);

    ctx.processor().checkReadOnlyConflict(field);

    verify(ctx.messager(), never()).printMessage(any(), any(), any());
  }

  @Test
  public void editableOnlyWhenCreatingAlone_isOk() {
    var ctx = buildContext();
    var field = mock(Element.class);
    when(field.getAnnotation(ReadOnly.class)).thenReturn(null);
    when(field.getAnnotation(EditableOnlyWhenCreating.class))
        .thenReturn(mock(EditableOnlyWhenCreating.class));

    ctx.processor().checkReadOnlyConflict(field);

    verify(ctx.messager(), never()).printMessage(any(), any(), any());
  }

  // ---------------------------------------------------------------------------
  // checkActionFieldsToValidate
  // ---------------------------------------------------------------------------

  @Test
  public void actionWithUnknownFieldsToValidate_isError() {
    var ctx = buildContext();
    var method = mockMethodInClass("MyClass", List.of());
    var action = mock(Action.class);
    when(action.fieldsToValidate()).thenReturn("nonExistentField");
    when(method.getAnnotationsByType(Action.class)).thenReturn(new Action[] {action});

    ctx.processor().checkActionFieldsToValidate(method);

    verify(ctx.messager()).printMessage(eq(Kind.ERROR), contains("nonExistentField"), eq(method));
  }

  @Test
  public void actionWithKnownFieldsToValidate_isOk() {
    var ctx = buildContext();
    var nameField = mockField("name");
    var method = mockMethodInClass("MyClass", List.of(nameField));
    var action = mock(Action.class);
    when(action.fieldsToValidate()).thenReturn("name");
    when(method.getAnnotationsByType(Action.class)).thenReturn(new Action[] {action});

    ctx.processor().checkActionFieldsToValidate(method);

    verify(ctx.messager(), never()).printMessage(any(), any(), any());
  }

  @Test
  public void actionWithMultipleFieldsOneUnknown_isError() {
    var ctx = buildContext();
    var nameField = mockField("name");
    var method = mockMethodInClass("MyClass", List.of(nameField));
    var action = mock(Action.class);
    when(action.fieldsToValidate()).thenReturn("name, unknownField");
    when(method.getAnnotationsByType(Action.class)).thenReturn(new Action[] {action});

    ctx.processor().checkActionFieldsToValidate(method);

    verify(ctx.messager()).printMessage(eq(Kind.ERROR), contains("unknownField"), eq(method));
  }

  @Test
  public void actionWithEmptyFieldsToValidate_isOk() {
    var ctx = buildContext();
    var method = mockMethodInClass("MyClass", List.of());
    var action = mock(Action.class);
    when(action.fieldsToValidate()).thenReturn("");
    when(method.getAnnotationsByType(Action.class)).thenReturn(new Action[] {action});

    ctx.processor().checkActionFieldsToValidate(method);

    verify(ctx.messager(), never()).printMessage(any(), any(), any());
  }

  @Test
  public void actionWithNoAnnotations_isOk() {
    var ctx = buildContext();
    var method = mockMethodInClass("MyClass", List.of());
    when(method.getAnnotationsByType(Action.class)).thenReturn(new Action[0]);

    ctx.processor().checkActionFieldsToValidate(method);

    verify(ctx.messager(), never()).printMessage(any(), any(), any());
  }

  // ---------------------------------------------------------------------------
  // checkRouteValue
  // ---------------------------------------------------------------------------

  @Test
  public void emptyRouteValue_isError() {
    var ctx = buildContext();
    var element = mock(Element.class);
    var route = mock(Route.class);
    when(route.value()).thenReturn("");
    when(element.getAnnotationsByType(Route.class)).thenReturn(new Route[] {route});

    ctx.processor().checkRouteValue(element);

    verify(ctx.messager()).printMessage(eq(Kind.ERROR), any(), eq(element));
  }

  @Test
  public void blankRouteValue_isError() {
    var ctx = buildContext();
    var element = mock(Element.class);
    var route = mock(Route.class);
    when(route.value()).thenReturn("  ");
    when(element.getAnnotationsByType(Route.class)).thenReturn(new Route[] {route});

    ctx.processor().checkRouteValue(element);

    verify(ctx.messager()).printMessage(eq(Kind.ERROR), any(), eq(element));
  }

  @Test
  public void validRouteValue_isOk() {
    var ctx = buildContext();
    var element = mock(Element.class);
    var route = mock(Route.class);
    when(route.value()).thenReturn("/products");
    when(element.getAnnotationsByType(Route.class)).thenReturn(new Route[] {route});

    ctx.processor().checkRouteValue(element);

    verify(ctx.messager(), never()).printMessage(any(), any(), any());
  }

  @Test
  public void noRouteAnnotations_isOk() {
    var ctx = buildContext();
    var element = mock(Element.class);
    when(element.getAnnotationsByType(Route.class)).thenReturn(new Route[0]);

    ctx.processor().checkRouteValue(element);

    verify(ctx.messager(), never()).printMessage(any(), any(), any());
  }

  // ---------------------------------------------------------------------------
  // process() integration
  // ---------------------------------------------------------------------------

  @Test
  public void processReturnsFalse() {
    var ctx = buildContext();
    assertThat(
            ctx.processor()
                .process(Set.of(), mock(javax.annotation.processing.RoundEnvironment.class)))
        .isFalse();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private Element mockField(String name) {
    var field = mock(Element.class);
    var fieldName = mock(Name.class);
    when(fieldName.toString()).thenReturn(name);
    when(field.getSimpleName()).thenReturn(fieldName);
    when(field.getKind()).thenReturn(ElementKind.FIELD);
    return field;
  }

  private Element mockMethodInClass(String className, List<Element> fields) {
    var method = mock(Element.class);
    when(method.getKind()).thenReturn(ElementKind.METHOD);

    var enclosing = mock(TypeElement.class);
    var simpleName = mock(Name.class);
    when(simpleName.toString()).thenReturn(className);
    when(enclosing.getSimpleName()).thenReturn(simpleName);
    doReturn(fields).when(enclosing).getEnclosedElements();
    when(method.getEnclosingElement()).thenReturn(enclosing);

    return method;
  }
}
