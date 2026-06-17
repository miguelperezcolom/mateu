package io.mateu.annotationprocessing;

import io.mateu.uidl.annotations.*;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import javax.annotation.processing.AbstractProcessor;
import javax.annotation.processing.RoundEnvironment;
import javax.annotation.processing.SupportedAnnotationTypes;
import javax.annotation.processing.SupportedSourceVersion;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.TypeElement;
import javax.tools.Diagnostic.Kind;

@SupportedAnnotationTypes({
  "io.mateu.uidl.annotations.Hidden",
  "io.mateu.uidl.annotations.HiddenInList",
  "io.mateu.uidl.annotations.HiddenInCreate",
  "io.mateu.uidl.annotations.HiddenInEditor",
  "io.mateu.uidl.annotations.HiddenInView",
  "io.mateu.uidl.annotations.ReadOnly",
  "io.mateu.uidl.annotations.EditableOnlyWhenCreating",
  "io.mateu.uidl.annotations.Action",
  "io.mateu.uidl.annotations.Actions",
  "io.mateu.uidl.annotations.Route"
})
@SupportedSourceVersion(SourceVersion.RELEASE_8)
public class MateuLintAnnotationProcessor extends AbstractProcessor {

  private static final Set<String> HIDDEN_ANNOTS =
      Set.of(
          "io.mateu.uidl.annotations.Hidden",
          "io.mateu.uidl.annotations.HiddenInList",
          "io.mateu.uidl.annotations.HiddenInCreate",
          "io.mateu.uidl.annotations.HiddenInEditor",
          "io.mateu.uidl.annotations.HiddenInView");
  private static final Set<String> EDITABLE_ANNOTS =
      Set.of(
          "io.mateu.uidl.annotations.ReadOnly",
          "io.mateu.uidl.annotations.EditableOnlyWhenCreating");
  private static final Set<String> ACTION_ANNOTS =
      Set.of("io.mateu.uidl.annotations.Action", "io.mateu.uidl.annotations.Actions");

  @Override
  public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
    Set<Element> checkedFields = new HashSet<>();

    for (TypeElement annotation : annotations) {
      String name = annotation.getQualifiedName().toString();
      Set<? extends Element> elements = roundEnv.getElementsAnnotatedWith(annotation);

      if (HIDDEN_ANNOTS.contains(name)) {
        for (Element e : elements) {
          if (e.getKind() == ElementKind.FIELD && checkedFields.add(e)) {
            checkHiddenCombinations(e);
          }
        }
      } else if (EDITABLE_ANNOTS.contains(name)) {
        for (Element e : elements) {
          if (e.getKind() == ElementKind.FIELD && checkedFields.add(e)) {
            checkReadOnlyConflict(e);
          }
        }
      } else if (ACTION_ANNOTS.contains(name)) {
        for (Element e : elements) {
          if (e.getKind() == ElementKind.METHOD) {
            checkActionFieldsToValidate(e);
          }
        }
      } else if ("io.mateu.uidl.annotations.Route".equals(name)) {
        for (Element e : elements) {
          checkRouteValue(e);
        }
      }
    }
    return false;
  }

  void checkHiddenCombinations(Element field) {
    Hidden hidden = field.getAnnotation(Hidden.class);
    if (hidden == null || !hidden.value().isEmpty()) {
      return; // conditional @Hidden is not redundant
    }
    if (field.getAnnotation(HiddenInList.class) != null) {
      error(field, "@Hidden already hides this field everywhere; @HiddenInList is redundant");
    }
    if (field.getAnnotation(HiddenInCreate.class) != null) {
      error(field, "@Hidden already hides this field everywhere; @HiddenInCreate is redundant");
    }
    if (field.getAnnotation(HiddenInEditor.class) != null) {
      error(field, "@Hidden already hides this field everywhere; @HiddenInEditor is redundant");
    }
    if (field.getAnnotation(HiddenInView.class) != null) {
      error(field, "@Hidden already hides this field everywhere; @HiddenInView is redundant");
    }
  }

  void checkReadOnlyConflict(Element field) {
    if (field.getAnnotation(ReadOnly.class) != null
        && field.getAnnotation(EditableOnlyWhenCreating.class) != null) {
      error(field, "@ReadOnly and @EditableOnlyWhenCreating are contradictory on the same field");
    }
  }

  void checkActionFieldsToValidate(Element method) {
    Action[] actions = method.getAnnotationsByType(Action.class);
    if (actions == null || actions.length == 0) return;
    TypeElement enclosingClass = (TypeElement) method.getEnclosingElement();
    Set<String> fieldNames =
        enclosingClass.getEnclosedElements().stream()
            .filter(e -> e.getKind() == ElementKind.FIELD)
            .map(e -> e.getSimpleName().toString())
            .collect(Collectors.toSet());

    for (Action action : actions) {
      String fieldsToValidate = action.fieldsToValidate();
      if (fieldsToValidate == null || fieldsToValidate.isBlank()) continue;
      for (String raw : fieldsToValidate.split(",")) {
        String fieldName = raw.trim();
        if (!fieldName.isEmpty() && !fieldNames.contains(fieldName)) {
          error(
              method,
              "@Action(fieldsToValidate) references unknown field '"
                  + fieldName
                  + "' in "
                  + enclosingClass.getSimpleName());
        }
      }
    }
  }

  void checkRouteValue(Element element) {
    Route[] routes = element.getAnnotationsByType(Route.class);
    if (routes == null) return;
    for (Route route : routes) {
      if (route.value() == null || route.value().isBlank()) {
        error(element, "@Route value must not be blank");
      }
    }
  }

  void error(Element e, String msg) {
    processingEnv.getMessager().printMessage(Kind.ERROR, "[Mateu] " + msg, e);
  }
}
