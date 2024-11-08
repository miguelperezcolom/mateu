package io.mateu.core.domain.model.outbound.metadataBuilders.fields;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.files.FileChecker;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.usecases.GetterProvider;
import io.mateu.core.domain.model.reflection.usecases.MethodProvider;
import io.mateu.core.domain.model.reflection.usecases.SetterProvider;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Icon;
import io.mateu.uidl.data.ExternalReference;
import io.mateu.uidl.data.IconChooser;
import io.mateu.uidl.interfaces.ComplexKeyChoice;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class FieldStereotypeMapper {

  private final Map<RichTextComponent, String> richTextMapping =
      Map.of(
          RichTextComponent.Unlayer, "rich-text-unlayer",
          RichTextComponent.Tinymce, "rich-text-tinymce",
          RichTextComponent.Vaadin, "rich-text-vaadin",
          RichTextComponent.Ckeditor, "rich-text-ckeditor");

  final FileChecker fileChecker;
  final ReflectionService reflectionService;
  final SetterProvider setterProvider;
  final MethodProvider methodProvider;
  private final GetterProvider getterProvider;

  public String mapStereotype(Object view, Field field) {
    if (field.isAnnotationPresent(CustomFieldStereotype.class)) {
      return field.getAnnotation(CustomFieldStereotype.class).value();
    }
    if (field.isAnnotationPresent(RawContent.class)) {
      return "rawcontent";
    }
    if (field.isAnnotationPresent(Image.class)) {
      return "image";
    }
    if (field.isAnnotationPresent(Icon.class)) {
      return "icon";
    }
    if (io.mateu.uidl.interfaces.Icon.class.equals(field.getType())) {
      return "icon";
    }
    if (view != null
        && methodProvider.getMethod(
                view.getClass(), getterProvider.getGetter(view.getClass(), field.getName()))
            != null
        && methodProvider.getMethod(
                view.getClass(), setterProvider.getSetter(view.getClass(), field.getName()))
            == null) {
      return "readonly";
    }
    if (field.isAnnotationPresent(ReadOnly.class)
        || view.getClass().isAnnotationPresent(ReadOnly.class)) {
      return "readonly";
    }
    if (field.isAnnotationPresent(Email.class)) {
      return "email";
    }
    if (field.isAnnotationPresent(Password.class)) {
      return "password";
    }
    if (field.isAnnotationPresent(UseRadioButtons.class)) {
      return "radiobuttons";
    }
    if (field.isAnnotationPresent(Toggle.class)) {
      return "toggle";
    }
    if (IconChooser.class.equals(field.getType())) {
      return "combobox";
    }
    if (field.getType().isEnum()) {
      return "combobox";
    }
    if (field.isAnnotationPresent(GeneratedValue.class)) {
      return "readonly";
    }
    if (field.isAnnotationPresent(Id.class)) {
      try {
        Object initialValue = reflectionService.getValue(field, view);
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
    if (ComplexKeyChoice.class.equals(field.getType())) {
      return "field-complexkeychoice";
    }
    if (Collection.class.isAssignableFrom(field.getType())
        && !reflectionService.isBasic(field.getGenericClass())
        && !ExternalReference.class.equals(field.getGenericClass())
        && !field.getGenericClass().isEnum()) {
      return "crud";
    }
    return "input";
  }
}
