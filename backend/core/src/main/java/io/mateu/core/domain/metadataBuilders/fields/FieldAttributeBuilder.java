package io.mateu.core.domain.metadataBuilders.fields;

import io.mateu.core.domain.files.FileChecker;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.data.TelephoneNumber;
import io.mateu.mdd.shared.data.ValuesListProvider;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Column;
import io.mateu.remote.dtos.Pair;
import io.mateu.remote.dtos.TelephonePrefix;
import io.mateu.remote.dtos.Value;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FieldAttributeBuilder {

  @Autowired FileChecker fileChecker;

  @Autowired FieldTypeMapper fieldTypeMapper;

  public List<Pair> buildAttributes(Object view, FieldInterfaced field) {
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
            attributes.add(Pair.builder().key("prefix").value(v).build());
          });
    }
    if (field.isAnnotationPresent(Width.class)) {
      attributes.add(
          Pair.builder().key("width").value(field.getAnnotation(Width.class).value()).build());
    }
    if (field.isAnnotationPresent(ItemsProvider.class)) {
      attributes.add(
          Pair.builder()
              .key("itemprovider")
              .value(field.getAnnotation(ItemsProvider.class).value().getName())
              .build());
    }
    if (field.isAnnotationPresent(ManyToOne.class)) {
      attributes.add(Pair.builder().key("itemprovider").value(field.getType().getName()).build());
    }
    if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {
      if (!field.isAnnotationPresent(UseCrud.class)) {
        attributes.add(
            Pair.builder().key("itemprovider").value(field.getGenericClass().getName()).build());
      }
    }
    if (field.isAnnotationPresent(ValuesProvider.class)) {
      try {
        ValuesListProvider provider =
            (ValuesListProvider)
                ReflectionHelper.newInstance(field.getAnnotation(ValuesProvider.class).value());
        provider
            .getAll()
            .forEach(
                v -> {
                  attributes.add(
                      Pair.builder()
                          .key("choice")
                          .value(Value.builder().key("" + v).value(v).build())
                          .build());
                });
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    if (field.isAnnotationPresent(ValuesProviderMethod.class)) {
      try {
        Method m =
            ReflectionHelper.getMethod(
                field.getDeclaringClass(), field.getAnnotation(ValuesProviderMethod.class).value());
        List<io.mateu.mdd.shared.data.Value> choices =
            (List<io.mateu.mdd.shared.data.Value>) m.invoke(view);
        choices.forEach(
            v -> {
              attributes.add(
                  Pair.builder()
                      .key("choice")
                      .value(Value.builder().key(v.getKey()).value(v.getValue()).build())
                      .build());
            });
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    if (fileChecker.isFile(field)) {
      attributes.add(
          Pair.builder().key("fileidprefix").value("mateuremoteistheremoteflavourofmateu").build());
      if (List.class.isAssignableFrom(field.getType()) || field.getType().isArray()) {
        attributes.add(Pair.builder().key("maxfiles").value(3).build());
      } else {
        attributes.add(Pair.builder().key("maxfiles").value(1).build());
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
        m = enumType.getMethod("value", null);
        for (Object enumConstant : enumType.getEnumConstants()) {
          Object value = m.invoke(enumConstant, null);
          attributes.add(
              Pair.builder()
                  .key("choice")
                  .value(Value.builder().key(enumConstant.toString()).value(value).build())
                  .build());
        }
      } catch (Exception e) {
        for (Object enumConstant : enumType.getEnumConstants()) {
          attributes.add(
              Pair.builder()
                  .key("choice")
                  .value(Value.builder().key(enumConstant.toString()).value(enumConstant).build())
                  .build());
        }
      }
    }
    if (Collection.class.isAssignableFrom(field.getType())
        && !ReflectionHelper.isBasico(field.getType())
        && !ExternalReference.class.equals(field.getGenericClass())
        && !field.getGenericClass().isEnum()) {
      for (FieldInterfaced columnField :
          ReflectionHelper.getAllEditableFields(field.getGenericClass())) {
        attributes.add(
            Pair.builder()
                .key("column")
                .value(
                    Column.builder()
                        .id(columnField.getId())
                        .caption(ReflectionHelper.getCaption(columnField))
                        .type(fieldTypeMapper.mapColumnType(columnField))
                        .readOnly(isReadOnly(columnField))
                        .stereotype("column")
                        .attributes(List.of())
                        .width(fieldTypeMapper.getWidth(columnField))
                        .build())
                .build());
      }
    }
    return attributes;
  }

  private boolean isReadOnly(FieldInterfaced field) {
    return field.isAnnotationPresent(ReadOnly.class) || field.isAnnotationPresent(Output.class);
  }
}
