package io.mateu.core.domain.out.componentmapper;

import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.NavLink;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.RemoteCoordinates;
import io.mateu.uidl.interfaces.ColspanSupplier;
import io.mateu.uidl.interfaces.DescriptionSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.LinkSupplier;
import io.mateu.uidl.interfaces.OptionsSupplier;
import io.mateu.uidl.interfaces.RequiredSupplier;
import io.mateu.uidl.interfaces.StyleSupplier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class FieldMetadataExtractor {

  public static String getLabel(AnnotatedElement fieldOrMethod) {
    if (MetaAnnotations.isPresent(fieldOrMethod, Label.class)) {
      return TranslatorContext.translate(MetaAnnotations.find(fieldOrMethod, Label.class).value());
    }
    if (fieldOrMethod instanceof Field field) {
      return TranslatorContext.translate(toUpperCaseFirst(field.getName()));
    }
    if (fieldOrMethod instanceof Method method) {
      return TranslatorContext.translate(toUpperCaseFirst(method.getName()));
    }
    return "Not a field nor a method";
  }

  public static String getLabel(Field field, Object instance, HttpRequest httpRequest) {
    if (instance instanceof LabelSupplier labelSupplier) {
      var supplied = labelSupplier.label(field.getName(), httpRequest);
      if (supplied != null && !supplied.isEmpty()) {
        return supplied;
      }
    }
    return getLabel((AnnotatedElement) field);
  }

  public static String getFieldId(Field field, String prefix, boolean readOnly) {
    if (readOnly && MetaAnnotations.isPresent(field, Lookup.class)) {
      return prefix + field.getName() + "-label";
    }
    if (readOnly && MetaAnnotations.isPresent(field, Searchable.class)) {
      return prefix + field.getName() + "-label";
    }
    return prefix + field.getName();
  }

  static int getColspan(Field field) {
    if (MetaAnnotations.isPresent(field, Colspan.class)) {
      return MetaAnnotations.find(field, Colspan.class).value();
    }
    return 1;
  }

  static int getColspan(Field field, Object instance, HttpRequest httpRequest) {
    if (instance instanceof ColspanSupplier colspanSupplier) {
      var supplied = colspanSupplier.colspan(field.getName(), httpRequest);
      if (supplied > 0) {
        return supplied;
      }
    }
    return getColspan(field);
  }

  static String getStyle(Field field, Object instance, HttpRequest httpRequest) {
    if (instance instanceof StyleSupplier styleSupplier) {
      var supplied = styleSupplier.style(field.getName(), httpRequest);
      if (supplied != null && !supplied.isEmpty()) {
        return supplied;
      }
    }
    if (MetaAnnotations.isPresent(field, Style.class)) {
      return MetaAnnotations.find(field, Style.class).value();
    }
    return "";
  }

  static String getDescription(Field field, Object instance, HttpRequest httpRequest) {
    if (instance instanceof DescriptionSupplier descriptionSupplier) {
      var supplied = descriptionSupplier.description(field.getName(), httpRequest);
      if (supplied != null && !supplied.isEmpty()) {
        return supplied;
      }
    }
    if (MetaAnnotations.isPresent(field, Help.class)) {
      return MetaAnnotations.find(field, Help.class).value();
    }
    return "";
  }

  static NavLink getLink(Field field, Object instance, HttpRequest httpRequest) {
    if (instance instanceof LinkSupplier linkSupplier) {
      var supplied = linkSupplier.link(field.getName(), httpRequest);
      if (supplied != null) {
        return supplied;
      }
    }
    if (MetaAnnotations.isPresent(field, LinkTo.class)) {
      var linkTo = MetaAnnotations.find(field, LinkTo.class);
      return NavLink.builder()
          .href(linkTo.value())
          .icon(linkTo.icon())
          .title(linkTo.title())
          .target(linkTo.target())
          .build();
    }
    return null;
  }

  static Map<String, String> getAttributes(Field field) {
    if (MetaAnnotations.isPresent(field, DivStyle.class)) {
      return Map.of("divStyle", MetaAnnotations.find(field, DivStyle.class).value());
    }
    return Map.of();
  }

  static boolean isRequired(Field field, Object instance, HttpRequest httpRequest) {
    return MetaAnnotations.isPresent(field, NotNull.class)
        || MetaAnnotations.isPresent(field, NotEmpty.class)
        || (instance instanceof RequiredSupplier rs && rs.isRequired(field.getName(), httpRequest));
  }

  static Double getMin(Field field) {
    if (MetaAnnotations.isPresent(field, Min.class)) {
      return (double) MetaAnnotations.find(field, Min.class).value();
    }
    return null;
  }

  static Double getMax(Field field) {
    if (MetaAnnotations.isPresent(field, Max.class)) {
      return (double) MetaAnnotations.find(field, Max.class).value();
    }
    return null;
  }

  static boolean getStepButtonsVisible(Field field) {
    return int.class.equals(field.getType())
        || Integer.class.equals(field.getType())
        || long.class.equals(field.getType())
        || Long.class.equals(field.getType())
        || BigInteger.class.equals(field.getType());
  }

  static int getSliderMin(Field field) {
    if (MetaAnnotations.isPresent(field, SliderMin.class)) {
      return MetaAnnotations.find(field, SliderMin.class).value();
    }
    return 0;
  }

  static int getSliderMax(Field field) {
    if (MetaAnnotations.isPresent(field, SliderMax.class)) {
      return MetaAnnotations.find(field, SliderMax.class).value();
    }
    return 100;
  }

  static RemoteCoordinates getRemoteCoordinates(String prefix, Field field) {
    if (MetaAnnotations.isPresent(field, Lookup.class)) {
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
          Label label = MetaAnnotations.find(enumField, Label.class);
          String labelValue = label != null ? label.value() : enumConstant.toString();
          Icon icon = MetaAnnotations.find(enumField, Icon.class);
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
    if (MetaAnnotations.isPresent(field, OptionsLayout.class)) {
      return MetaAnnotations.find(field, OptionsLayout.class).columns();
    }
    return 1;
  }

  static boolean isMultiline(Field field) {
    return MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Multiline.class)
        || MetaAnnotations.isPresent(
            field.getDeclaringClass(), io.mateu.uidl.annotations.Multiline.class);
  }
}
