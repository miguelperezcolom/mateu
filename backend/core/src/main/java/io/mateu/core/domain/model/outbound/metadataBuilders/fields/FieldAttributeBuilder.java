package io.mateu.core.domain.model.outbound.metadataBuilders.fields;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.files.FileChecker;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.data.ExternalReference;
import io.mateu.core.domain.uidefinition.shared.data.TelephoneNumber;
import io.mateu.core.domain.uidefinition.shared.data.ValuesListProvider;
import io.mateu.dtos.Column;
import io.mateu.dtos.Pair;
import io.mateu.dtos.TelephonePrefix;
import io.mateu.dtos.Value;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class FieldAttributeBuilder {

  final FileChecker fileChecker;
  final FieldTypeMapper fieldTypeMapper;
  final ReflectionHelper reflectionHelper;
  final CaptionProvider captionProvider;

  public List<Pair> buildAttributes(Object view, Field field) {
    List<Pair> attributes = new ArrayList<>();
    if (TelephoneNumber.class.equals(field.getType())) {
      List<TelephonePrefix> prefixes =
          List.of(
              TelephonePrefix.builder()
                  .key("es")
                  .img("https://flagcdn.com/es.svg")
                  .value("+34")
                  .build(),
              TelephonePrefix.builder()
                  .key("de")
                  .img("https://flagcdn.com/de.svg")
                  .value("+49")
                  .build(),
              TelephonePrefix.builder()
                  .key("us")
                  .img("https://flagcdn.com/us.svg")
                  .value("+1")
                  .build(),
              TelephonePrefix.builder()
                  .key("uy")
                  .img("https://flagcdn.com/uy.svg")
                  .value("+598")
                  .build());
      prefixes.forEach(
          v -> {
            attributes.add(new Pair("prefix", v));
          });
    }
    if (field.isAnnotationPresent(Width.class)) {
      attributes.add(new Pair("width", field.getAnnotation(Width.class).value()));
    }
    if (field.isAnnotationPresent(ItemsProvider.class)) {
      attributes.add(
          new Pair("itemprovider", field.getAnnotation(ItemsProvider.class).value().getName()));
    }
    if (field.isAnnotationPresent(ManyToOne.class)) {
      attributes.add(new Pair("itemprovider", field.getType().getName()));
    }
    if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {
      if (!field.isAnnotationPresent(UseCrud.class)) {
        attributes.add(new Pair("itemprovider", field.getGenericClass().getName()));
      }
    }
    if (field.isAnnotationPresent(ValuesProvider.class)) {
      try {
        ValuesListProvider provider =
            (ValuesListProvider)
                reflectionHelper.newInstance(field.getAnnotation(ValuesProvider.class).value());
        provider
            .getAll()
            .forEach(
                v -> {
                  attributes.add(new Pair("choice", new Value("" + v, v)));
                });
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    if (field.isAnnotationPresent(ValuesProviderMethod.class)) {
      try {
        Method m =
            reflectionHelper.getMethod(
                field.getDeclaringClass(), field.getAnnotation(ValuesProviderMethod.class).value());
        List<Value> choices = (List<Value>) m.invoke(view);
        choices.forEach(
            v -> {
              attributes.add(new Pair("choice", new Value(v.key(), v.value())));
            });
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    if (fileChecker.isFile(field)) {
      attributes.add(new Pair("fileidprefix", "mateuremoteistheremoteflavourofmateu"));
      if (List.class.isAssignableFrom(field.getType()) || field.getType().isArray()) {
        attributes.add(new Pair("maxfiles", 3));
      } else {
        attributes.add(new Pair("maxfiles", 1));
      }
    }
    if (field.getType().isEnum()
        || (field.getType().isArray() && field.getType().getComponentType().isEnum())
        || (List.class.isAssignableFrom(field.getType()) && field.getGenericClass().isEnum())) {
      Class enumType = field.getType();
      if (enumType.isArray()) enumType = enumType.getComponentType();
      if (List.class.isAssignableFrom(enumType)) enumType = field.getGenericClass();
      Method m = null;
      try {
        m = enumType.getMethod("valueOf", (Class<?>[]) null);
        for (Object enumConstant : enumType.getEnumConstants()) {
          Object value = m.invoke(enumConstant, (Object[]) null);
          attributes.add(new Pair("choice", new Value(enumConstant.toString(), value)));
        }
      } catch (Throwable ignored) {
        for (Object enumConstant : enumType.getEnumConstants()) {
          attributes.add(new Pair("choice", new Value(enumConstant.toString(), enumConstant)));
        }
      }
    }
    if (Collection.class.isAssignableFrom(field.getType())
        && !reflectionHelper.isBasic(field.getType())
        && !ExternalReference.class.equals(field.getGenericClass())
        && !field.getGenericClass().isEnum()) {
      for (Field columnField : reflectionHelper.getAllEditableFields(field.getGenericClass())) {
        attributes.add(
            new Pair(
                "column",
                new Column(
                    columnField.getId(),
                    "column",
                    fieldTypeMapper.mapColumnType(columnField),
                    captionProvider.getCaption(columnField),
                    "",
                    fieldTypeMapper.getWidth(columnField),
                    isReadOnly(columnField),
                    List.of())));
      }
    }
    return attributes;
  }

  private boolean isReadOnly(Field field) {
    return field.isAnnotationPresent(ReadOnly.class) || field.isAnnotationPresent(Output.class);
  }
}
