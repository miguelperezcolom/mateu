package io.mateu.core.domain.model.outbound.metadataBuilders.fields;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.files.FileChecker;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.outbound.metadataBuilders.ButtonMetadataBuilder;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.*;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Content;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.Element;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.ExternalReference;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.IconChooser;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.TelephoneNumber;
import io.mateu.core.domain.uidefinitionlanguage.shared.data.ValuesListProvider;
import io.mateu.dtos.*;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class FieldAttributeBuilder {

  final FileChecker fileChecker;
  final FieldTypeMapper fieldTypeMapper;
  final ReflectionHelper reflectionHelper;
  final CaptionProvider captionProvider;
  final ButtonMetadataBuilder buttonMetadataBuilder;
  private final Humanizer humanizer;

  @SneakyThrows
  public List<Pair> buildAttributes(Object view, Field field) {
    List<Pair> attributes = new ArrayList<>();
    if (field.isAnnotationPresent(CallActionOnClick.class)) {
      CallActionOnClick clickable = field.getAnnotation(CallActionOnClick.class);
      attributes.add(new Pair("action", clickable.value()));
    }
    if (field.isAnnotationPresent(Image.class)) {
      Image image = field.getAnnotation(Image.class);
      if (!image.cssClasses().isEmpty()) {
        attributes.add(new Pair("cssClasses", image.cssClasses()));
      }
      if (!image.style().isEmpty()) {
        attributes.add(new Pair("style", image.style()));
      }
      if (!image.action().isEmpty()) {
        attributes.add(new Pair("action", image.action()));
      }
    }
    if (field.isAnnotationPresent(Icon.class)) {
      Icon icon = field.getAnnotation(Icon.class);
      attributes.add(new Pair("icon-src", "icon-src"));
      if (!icon.cssClasses().isEmpty()) {
        attributes.add(new Pair("cssClasses", icon.cssClasses()));
      }
      if (!icon.style().isEmpty()) {
        attributes.add(new Pair("style", icon.style()));
      }
      if (!icon.action().isEmpty()) {
        attributes.add(new Pair("action", icon.action()));
      }
    }
    if (field.isAnnotationPresent(Styled.class)) {
      Styled styled = field.getAnnotation(Styled.class);
      if (!styled.cssClasses().isEmpty()) {
        attributes.add(new Pair("cssClasses", styled.cssClasses()));
      }
      if (!styled.style().isEmpty()) {
        attributes.add(new Pair("style", styled.style()));
      }
    }
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
    if (field.isAnnotationPresent(FlexGrow.class)) {
      attributes.add(new Pair("flex-grow", field.getAnnotation(FlexGrow.class).value()));
    }
    if (field.isAnnotationPresent(Button.class)) {
      attributes.add(new Pair("buttonMetadata", buttonMetadataBuilder.getAction(field)));
    }
    if (field.isAnnotationPresent(Width.class)) {
      attributes.add(new Pair("width", field.getAnnotation(Width.class).value()));
    }
    if (field.isAnnotationPresent(Height.class)) {
      attributes.add(new Pair("height", field.getAnnotation(Height.class).value()));
    }
    if (field.isAnnotationPresent(Style.class)) {
      attributes.add(new Pair("style", field.getAnnotation(Style.class).value()));
    }
    if (field.isAnnotationPresent(CssClasses.class)) {
      attributes.add(new Pair("cssClasses", field.getAnnotation(CssClasses.class).value()));
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
    if (field.getType().equals(IconChooser.class)) {
      for (Object enumConstant : io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Icon.values()) {
        attributes.add(
            new Pair(
                "choice",
                new Value(humanizer.capitalize(enumConstant.toString()), enumConstant.toString())));
      }
    }
    if ((field.getType().isEnum()
            && !io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Icon.class.equals(
                field.getType()))
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
                    List.of(),
                    columnField.isAnnotationPresent(Detail.class))));
      }
      if (field.isAnnotationPresent(Table.class)) {
        var table = field.getAnnotation(Table.class);
        if (table.editable()) {
          attributes.add(new Pair("editable", "true"));
        }
        if (table.filterable()) {
          attributes.add(new Pair("filterable", "true"));
        }
      }
    }
    if (field.getType().isAnnotationPresent(Element.class)) {
      reflectionHelper.getAllFields(field.getType()).stream()
          .filter(m -> m.isAnnotationPresent(Content.class))
          .forEach(
              m -> {
                attributes.add(new Pair("contentField", m.getName()));
              });
      reflectionHelper.getAllMethods(field.getType()).stream()
          .filter(m -> m.isAnnotationPresent(On.class))
          .forEach(
              m -> {
                var on = m.getAnnotation(On.class);
                attributes.add(
                    new Pair(
                        "listener",
                        new Listener(on.value(), field.getName() + "." + m.getName(), on.js())));
              });
    }
    return attributes;
  }
}
