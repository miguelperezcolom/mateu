package io.mateu.remote.domain.metadataBuilders.fields;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.files.FileChecker;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Service
public class FieldStereotypeMapper {

    private final Map<RichTextComponent, String> richTextMapping = Map.of(
            RichTextComponent.Unlayer, "rich-text-unlayer",
            RichTextComponent.Tinymce, "rich-text-tinymce",
            RichTextComponent.Vaadin, "rich-text-vaadin",
            RichTextComponent.Ckeditor, "rich-text-ckeditor"
    );

    @Autowired
    FileChecker fileChecker;

    public String mapStereotype(Object view, FieldInterfaced field) {
        if (field.isAnnotationPresent(CustomFieldStereotype.class)) {
            return field.getAnnotation(CustomFieldStereotype.class).value();
        }
        if (field.isAnnotationPresent(CustomElement.class)) {
            return "custom:" + field.getAnnotation(CustomElement.class).value();
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
                Object initialValue = ReflectionHelper.getValue(field, view);
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
                System.out.println("IMPORTANT!!! Please notice that the Vaadin rich text component is commercial licensed. Please do not use it unless you have an agreement with Vaadin.");
            }
            return richTextMapping.get(component);
        }
        if (field.isAnnotationPresent(TextArea.class)) {
            return "textarea";
        }
        if (field.isAnnotationPresent(ItemsProvider.class)) {
            return "externalref";
        }
        if (field.isAnnotationPresent(ManyToOne.class)) {
            return "externalref";
        }
        if (field.isAnnotationPresent(UseChips.class)) {
            return "externalref";
        }
        if (fileChecker.isFile(field)) {
            return "file";
        }
        if (field.isAnnotationPresent(ValuesProvider.class) || field.isAnnotationPresent(ValuesProviderMethod.class)) {
            if (List.class.isAssignableFrom(field.getType())) {
                return "closedlist";
            }
            return "combobox";
        }
        if (field.isAnnotationPresent(UseCheckboxes.class)) {
            return "externalref-checkboxes";
        }
        if (field.getType().isAnnotationPresent(Element.class)) {
            return "element:" + field.getType().getAnnotation(Element.class).value();
        }
        if (Collection.class.isAssignableFrom(field.getType())
                && !ReflectionHelper.isBasico(field.getType())
                && !ExternalReference.class.equals(field.getGenericClass())
                && !field.getGenericClass().isEnum()
        ) {
            return "crud";
        }
        return "input";
    }

}
