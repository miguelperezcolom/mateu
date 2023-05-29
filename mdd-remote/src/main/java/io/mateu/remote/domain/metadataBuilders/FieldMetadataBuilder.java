package io.mateu.remote.domain.metadataBuilders;

import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.metadataBuilders.fields.FieldAttributeBuilder;
import io.mateu.remote.domain.metadataBuilders.fields.FieldStereotypeMapper;
import io.mateu.remote.domain.metadataBuilders.fields.FieldTypeMapper;
import io.mateu.remote.dtos.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class FieldMetadataBuilder {

    @Autowired
    FieldAttributeBuilder fieldAttributeBuilder;

    @Autowired
    FieldTypeMapper fieldTypeMapper;

    @Autowired
    FieldStereotypeMapper fieldStereotypeMapper;


    protected Field getField(Object view, FieldInterfaced fieldInterfaced) {
        Field field = Field.builder()
                .id(fieldInterfaced.getId())
                .caption(ReflectionHelper.getCaption(fieldInterfaced))
                .placeholder(getPlaceholder(fieldInterfaced))
                .description(getDescription(fieldInterfaced))
                .cssClasses(getCssClassNames(fieldInterfaced))
                .type(fieldTypeMapper.mapFieldType(fieldInterfaced))
                .stereotype(fieldStereotypeMapper.mapStereotype(fieldInterfaced))
                .observed(isObserved(fieldInterfaced))
                .attributes(fieldAttributeBuilder.buildAttributes(view, fieldInterfaced))
                .build();
        addValidations(field, fieldInterfaced);
        return field;
    }

    private boolean isObserved(FieldInterfaced fieldInterfaced) {
        return fieldInterfaced.isAnnotationPresent(CallActionOnChange.class);
    }

    private String getCssClassNames(FieldInterfaced fieldInterfaced) {
        if (fieldInterfaced.isAnnotationPresent(StyleClassNames.class)) {
            return String.join(" ", fieldInterfaced.getAnnotation(StyleClassNames.class).value());
        }
        return null;
    }

    private String getPlaceholder(FieldInterfaced fieldInterfaced) {
        if (fieldInterfaced.isAnnotationPresent(Placeholder.class)) {
            return fieldInterfaced.getAnnotation(Placeholder.class).value();
        }
        return null;
    }


    private void addValidations(Field field, FieldInterfaced fieldInterfaced) {
        List<Validation> validations = new ArrayList<>();
        //todo: añadir otros tipos de validación, y mensaje de error
        if (fieldInterfaced.isAnnotationPresent(NotEmpty.class)
                || fieldInterfaced.isAnnotationPresent(NotNull.class)
                || fieldInterfaced.isAnnotationPresent(NotBlank.class)
        ) {
            validations.add(Validation.builder()
                            .type(ValidationType.NotEmpty)
                            .data(null)
                    .build());
        }
        field.setValidations(validations);
    }

    private String getDescription(FieldInterfaced fieldInterfaced) {
        String description = null;
        if (fieldInterfaced.isAnnotationPresent(Help.class)) {
            description = fieldInterfaced.getAnnotation(Help.class).value();
        }
        return description;
    }

}
