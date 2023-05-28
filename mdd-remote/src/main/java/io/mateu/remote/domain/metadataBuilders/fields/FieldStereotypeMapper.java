package io.mateu.remote.domain.metadataBuilders.fields;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.files.FileChecker;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FieldStereotypeMapper {

    @Autowired
    FileChecker fileChecker;

    public String mapStereotype(FieldInterfaced field) {
        if (field.isAnnotationPresent(CustomFieldStereotype.class)) {
            return field.getAnnotation(CustomFieldStereotype.class).value();
        }
        if (field.isAnnotationPresent(CustomElement.class)) {
            return "custom:" + field.getAnnotation(CustomElement.class).value();
        }
        if (field.isAnnotationPresent(RawContent.class)) {
            return "rawcontent";
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
        if (field.isAnnotationPresent(ReadOnly.class) || field.isAnnotationPresent(Output.class)) {
            return "readonly";
        }
        if (field.isAnnotationPresent(GeneratedValue.class)) {
            return "readonly";
        }
        if (field.isAnnotationPresent(Id.class)) {
            Object instance = null;
            try {
                instance = ReflectionHelper.newInstance(field.getDeclaringClass());
                Object initialValue = ReflectionHelper.getValue(field, instance);
                if (initialValue != null) {
                    return "readonly";
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
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
        return "input";
    }

}
