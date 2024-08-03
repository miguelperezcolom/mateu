package io.mateu.core.domain.model.outbound.metadataBuilders.fields;

import io.mateu.core.domain.model.files.FileChecker;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.data.ExternalReference;
import jakarta.persistence.*;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FieldStereotypeMapper {

  private final Map<RichTextComponent, String> richTextMapping =
      Map.of(
          RichTextComponent.Unlayer, "rich-text-unlayer",
          RichTextComponent.Tinymce, "rich-text-tinymce",
          RichTextComponent.Vaadin, "rich-text-vaadin",
          RichTextComponent.Ckeditor, "rich-text-ckeditor");

  final FileChecker fileChecker;
  final ReflectionHelper reflectionHelper;

  public String mapStereotype(Object view, Field field) {
    if (field.isAnnotationPresent(CustomFieldStereotype.class)) {
      return field.getAnnotation(CustomFieldStereotype.class).value();
    }
    if (field.isAnnotationPresent(RawContent.class)) {
      return "rawcontent";
    }
    if (field.isAnnotationPresent(ReadOnly.class) || field.isAnnotationPresent(Output.class)) {
      return "readonly";
    }
    if (field.isAnnotationPresent(UseRadioButtons.class)) {
      return "radiobuttons";
    }
    if (field.isAnnotationPresent(Toggle.class)) {
      return "toggle";
    }
    if (field.getType().isEnum()) {
      return "combobox";
    }
    if (field.isAnnotationPresent(GeneratedValue.class)) {
      return "readonly";
    }
    if (field.isAnnotationPresent(Id.class)) {
      try {
        Object initialValue = reflectionHelper.getValue(field, view);
        if (initialValue != null) {
          return "readonly";
        }
      } catch (Exception e) {
        e.printStackTrace();
      }
    }
    if (field.isAnnotationPresent(RichText.class)) {
      var component = field.getAnnotation(RichText.class).component();
      if (RichTextComponent.Vaadin.equals(component)) {
        System.out.println(
            "IMPORTANT!!! Please notice that the Vaadin rich text component is commercial licensed. Please do not use it unless you have an agreement with Vaadin.");
      }
      return richTextMapping.get(component);
    }
    if (field.isAnnotationPresent(TextArea.class)) {
      return "textarea";
    }
    if (field.isAnnotationPresent(Json.class)) {
      return "json";
    }
    if (field.isAnnotationPresent(ItemsProvider.class)) {
      return "externalref";
    }
    if (field.isAnnotationPresent(ValuesProvider.class)
        || field.isAnnotationPresent(ValuesProviderMethod.class)) {
      if (List.class.isAssignableFrom(field.getType())) {
        return "closedlist";
      }
      if ((field.isAnnotationPresent(OneToOne.class) || field.isAnnotationPresent(ManyToOne.class))
          && !field.isAnnotationPresent(UseCrud.class)) {
        return "externalrefclosedlist";
      }
      return "combobox";
    }
    if (field.isAnnotationPresent(ManyToOne.class)) {
      return "externalref";
    }
    if ((field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class))
        && !field.isAnnotationPresent(UseCrud.class)) {
      return "externalref";
    }
    if (fileChecker.isFile(field)) {
      return "file";
    }
    if (field.isAnnotationPresent(UseCheckboxes.class)) {
      return "externalref-checkboxes";
    }
    if (field.getType().isAnnotationPresent(Element.class)) {
      return "element:" + field.getType().getAnnotation(Element.class).value();
    }
    if (Collection.class.isAssignableFrom(field.getType())
        && !reflectionHelper.isBasic(field.getGenericClass())
        && !ExternalReference.class.equals(field.getGenericClass())
        && !field.getGenericClass().isEnum()) {
      return "crud";
    }
    return "input";
  }
}
