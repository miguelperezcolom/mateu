package io.mateu.core.domain.model.outbound.metadataBuilders.fields;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.files.FileChecker;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.outbound.metadataBuilders.ButtonMetadataBuilder;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.*;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Content;
import io.mateu.uidl.annotations.Element;
import io.mateu.uidl.annotations.Icon;
import io.mateu.uidl.data.ExternalReference;
import io.mateu.uidl.data.IconChooser;
import io.mateu.uidl.data.TelephoneNumber;
import io.mateu.uidl.data.ValuesListProvider;
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
  final ReflectionService reflectionService;
  final CaptionProvider captionProvider;
  final ButtonMetadataBuilder buttonMetadataBuilder;
  private final Humanizer humanizer;

  @SneakyThrows
  public List<PairDto> buildAttributes(Object view, Field field) {
    List<PairDto> attributes = new ArrayList<>();
    if (field.isAnnotationPresent(CallActionOnClick.class)) {
      CallActionOnClick clickable = field.getAnnotation(CallActionOnClick.class);
      attributes.add(new PairDto("action", clickable.value()));
    }
    if (field.isAnnotationPresent(Image.class)) {
      Image image = field.getAnnotation(Image.class);
      if (!image.cssClasses().isEmpty()) {
        attributes.add(new PairDto("cssClasses", image.cssClasses()));
      }
      if (!image.style().isEmpty()) {
        attributes.add(new PairDto("style", image.style()));
      }
      if (!image.action().isEmpty()) {
        attributes.add(new PairDto("action", image.action()));
      }
    }
    if (field.isAnnotationPresent(Icon.class)) {
      Icon icon = field.getAnnotation(Icon.class);
      attributes.add(new PairDto("icon-src", "icon-src"));
      if (!icon.cssClasses().isEmpty()) {
        attributes.add(new PairDto("cssClasses", icon.cssClasses()));
      }
      if (!icon.style().isEmpty()) {
        attributes.add(new PairDto("style", icon.style()));
      }
      if (!icon.action().isEmpty()) {
        attributes.add(new PairDto("action", icon.action()));
      }
    }
    if (field.isAnnotationPresent(Styled.class)) {
      Styled styled = field.getAnnotation(Styled.class);
      if (!styled.cssClasses().isEmpty()) {
        attributes.add(new PairDto("cssClasses", styled.cssClasses()));
      }
      if (!styled.style().isEmpty()) {
        attributes.add(new PairDto("style", styled.style()));
      }
    }
    if (TelephoneNumber.class.equals(field.getType())) {
      List<TelephonePrefixDto> prefixes =
          List.of(
              TelephonePrefixDto.builder()
                  .key("es")
                  .img("https://flagcdn.com/es.svg")
                  .value("+34")
                  .build(),
              TelephonePrefixDto.builder()
                  .key("de")
                  .img("https://flagcdn.com/de.svg")
                  .value("+49")
                  .build(),
              TelephonePrefixDto.builder()
                  .key("us")
                  .img("https://flagcdn.com/us.svg")
                  .value("+1")
                  .build(),
              TelephonePrefixDto.builder()
                  .key("uy")
                  .img("https://flagcdn.com/uy.svg")
                  .value("+598")
                  .build());
      prefixes.forEach(
          v -> {
            attributes.add(new PairDto("prefix", v));
          });
    }
    if (field.isAnnotationPresent(FlexGrow.class)) {
      attributes.add(new PairDto("flex-grow", field.getAnnotation(FlexGrow.class).value()));
    }
    if (field.isAnnotationPresent(Button.class)) {
      attributes.add(new PairDto("buttonMetadata", buttonMetadataBuilder.getAction(field)));
    }
    if (field.isAnnotationPresent(Width.class)) {
      attributes.add(new PairDto("width", field.getAnnotation(Width.class).value()));
    }
    if (field.isAnnotationPresent(Height.class)) {
      attributes.add(new PairDto("height", field.getAnnotation(Height.class).value()));
    }
    if (field.isAnnotationPresent(Style.class)) {
      attributes.add(new PairDto("style", field.getAnnotation(Style.class).value()));
    }
    if (field.isAnnotationPresent(CssClasses.class)) {
      attributes.add(new PairDto("cssClasses", field.getAnnotation(CssClasses.class).value()));
    }
    if (field.isAnnotationPresent(ItemsProvider.class)) {
      attributes.add(
          new PairDto("itemprovider", field.getAnnotation(ItemsProvider.class).value().getName()));
    }
    if (field.isAnnotationPresent(ManyToOne.class)) {
      attributes.add(new PairDto("itemprovider", field.getType().getName()));
    }
    if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {
      if (!field.isAnnotationPresent(UseCrud.class)) {
        attributes.add(new PairDto("itemprovider", field.getGenericClass().getName()));
      }
    }
    if (field.isAnnotationPresent(ValuesProvider.class)) {
      try {
        ValuesListProvider provider =
            (ValuesListProvider)
                reflectionService.newInstance(field.getAnnotation(ValuesProvider.class).value());
        provider
            .getAll()
            .forEach(
                v -> {
                  attributes.add(new PairDto("choice", new ValueDto("" + v, v)));
                });
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    if (field.isAnnotationPresent(ValuesProviderMethod.class)) {
      try {
        Method m =
            reflectionService.getMethod(
                field.getDeclaringClass(), field.getAnnotation(ValuesProviderMethod.class).value());
        List<ValueDto> choices = (List<ValueDto>) m.invoke(view);
        choices.forEach(
            v -> {
              attributes.add(new PairDto("choice", new ValueDto(v.key(), v.value())));
            });
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    if (fileChecker.isFile(field)) {
      attributes.add(new PairDto("fileidprefix", "mateuremoteistheremoteflavourofmateu"));
      if (List.class.isAssignableFrom(field.getType()) || field.getType().isArray()) {
        attributes.add(new PairDto("maxfiles", 3));
      } else {
        attributes.add(new PairDto("maxfiles", 1));
      }
    }
    if (field.getType().equals(IconChooser.class)) {
      for (Object enumConstant : io.mateu.uidl.interfaces.Icon.values()) {
        attributes.add(
            new PairDto(
                "choice",
                new ValueDto(
                    humanizer.capitalize(enumConstant.toString()), enumConstant.toString())));
      }
    }
    if ((field.getType().isEnum() && !io.mateu.uidl.interfaces.Icon.class.equals(field.getType()))
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
          attributes.add(new PairDto("choice", new ValueDto(enumConstant.toString(), value)));
        }
      } catch (Throwable ignored) {
        for (Object enumConstant : enumType.getEnumConstants()) {
          attributes.add(
              new PairDto("choice", new ValueDto(enumConstant.toString(), enumConstant)));
        }
      }
    }
    if (Collection.class.isAssignableFrom(field.getType())
        && !reflectionService.isBasic(field.getType())
        && !ExternalReference.class.equals(field.getGenericClass())
        && !field.getGenericClass().isEnum()) {
      for (Field columnField : reflectionService.getAllEditableFields(field.getGenericClass())) {
        attributes.add(
            new PairDto(
                "column",
                new ColumnDto(
                    columnField.getId(),
                    "column",
                    fieldTypeMapper.mapColumnType(columnField),
                    captionProvider.getCaption(columnField),
                    "",
                    fieldTypeMapper.getWidth(columnField),
                    List.of(),
                    columnField.isAnnotationPresent(Detail.class),
                    columnField.isAnnotationPresent(Sortable.class),
                    columnField.isAnnotationPresent(Sortable.class)
                        && columnField.getAnnotation(Sortable.class).serverSide())));
      }
      if (field.isAnnotationPresent(Table.class)) {
        var table = field.getAnnotation(Table.class);
        if (table.editable()) {
          attributes.add(new PairDto("editable", "true"));
        }
        if (table.filterable()) {
          attributes.add(new PairDto("filterable", "true"));
        }
      }
    }
    if (field.getType().isAnnotationPresent(Element.class)) {
      reflectionService.getAllFields(field.getType()).stream()
          .filter(m -> m.isAnnotationPresent(Content.class))
          .forEach(
              m -> {
                attributes.add(new PairDto("contentField", m.getName()));
              });
      reflectionService.getAllMethods(field.getType()).stream()
          .filter(m -> m.isAnnotationPresent(On.class))
          .forEach(
              m -> {
                var on = m.getAnnotation(On.class);
                attributes.add(
                    new PairDto(
                        "listener",
                        new ListenerDto(on.value(), field.getName() + "." + m.getName(), on.js())));
              });
    }
    return attributes;
  }
}
