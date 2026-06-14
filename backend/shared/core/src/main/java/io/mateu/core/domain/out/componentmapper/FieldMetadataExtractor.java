package io.mateu.core.domain.out.componentmapper;

import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.RemoteCoordinates;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import io.mateu.uidl.interfaces.RequiredSupplier;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FieldMetadataExtractor {

  public static String getLabel(AnnotatedElement fieldOrMethod) {
    if (fieldOrMethod.isAnnotationPresent(Label.class)) {
      return TranslatorContext.translate(fieldOrMethod.getAnnotation(Label.class).value());
    }
    if (fieldOrMethod instanceof Field field) {
      return TranslatorContext.translate(toUpperCaseFirst(field.getName()));
    }
    if (fieldOrMethod instanceof Method method) {
      return TranslatorContext.translate(toUpperCaseFirst(method.getName()));
    }
    return "Not a field nor a method";
  }

  public static String getFieldId(Field field, String prefix, boolean readOnly) {
    if (readOnly && field.isAnnotationPresent(Lookup.class)) {
      return prefix + field.getName() + "-label";
    }
    if (readOnly && field.isAnnotationPresent(Searchable.class)) {
      return prefix + field.getName() + "-label";
    }
    return prefix + field.getName();
  }

  static int getColspan(Field field) {
    if (field.isAnnotationPresent(Colspan.class)) {
      return field.getAnnotation(Colspan.class).value();
    }
    return 1;
  }

  static String getStyle(Field field) {
    if (field.isAnnotationPresent(Style.class)) {
      return field.getAnnotation(Style.class).value();
    }
    return "";
  }

  static String getDescription(Field field) {
    if (field.isAnnotationPresent(Help.class)) {
      return field.getAnnotation(Help.class).value();
    }
    return "";
  }

  static Map<String, String> getAttributes(Field field) {
    if (field.isAnnotationPresent(DivStyle.class)) {
      return Map.of("divStyle", field.getAnnotation(DivStyle.class).value());
    }
    return Map.of();
  }

  static boolean isRequired(Field field, Object instance, HttpRequest httpRequest) {
    return field.isAnnotationPresent(NotNull.class)
        || field.isAnnotationPresent(NotEmpty.class)
        || (instance instanceof RequiredSupplier rs && rs.isRequired(field.getName(), httpRequest));
  }

  static int getSliderMin(Field field) {
    if (field.isAnnotationPresent(SliderMin.class)) {
      return field.getAnnotation(SliderMin.class).value();
    }
    return 0;
  }

  static int getSliderMax(Field field) {
    if (field.isAnnotationPresent(SliderMax.class)) {
      return field.getAnnotation(SliderMax.class).value();
    }
    return 100;
  }

  static RemoteCoordinates getRemoteCoordinates(String prefix, Field field) {
    if (field.isAnnotationPresent(Lookup.class)) {
      return RemoteCoordinates.builder().action("search-" + prefix + field.getName()).build();
    }
    return null;
  }

  static List<Option> getOptions(Field field, Object instance, HttpRequest httpRequest) {
    if (instance instanceof OptionsSupplier optionsSupplier) {
      return optionsSupplier.options(field.getName(), httpRequest);
    }
    List<Option> options = new ArrayList<>();
    if (field.getType().isEnum()) {
      for (Object enumConstant : field.getType().getEnumConstants()) {
        try {
          Field enumField = field.getType().getField(enumConstant.toString());
          Label label = enumField.getAnnotation(Label.class);
          String labelValue = label != null ? label.value() : enumConstant.toString();
          Icon icon = enumField.getAnnotation(Icon.class);
          options.add(
              Option.builder()
                  .value(enumConstant.toString())
                  .label(labelValue)
                  .icon(icon != null ? icon.value().iconName : null)
                  .build());
        } catch (NoSuchFieldException e) {
          throw new RuntimeException(e);
        }
      }
    }
    return options;
  }

  static int getOptionsColumns(Field field) {
    if (field.isAnnotationPresent(OptionsLayout.class)) {
      return field.getAnnotation(OptionsLayout.class).columns();
    }
    return 1;
  }
}
