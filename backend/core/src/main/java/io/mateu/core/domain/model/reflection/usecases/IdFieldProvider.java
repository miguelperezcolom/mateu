package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.Field;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.springframework.stereotype.Service;

@Service
public class IdFieldProvider {

    private final AllFieldsProvider allFieldsProvider;

    public IdFieldProvider(AllFieldsProvider allFieldsProvider) {
        this.allFieldsProvider = allFieldsProvider;
    }

    public Field getIdField(Class type) {
        if (type.isAnnotationPresent(Entity.class)) {
            Field idField = null;

            for (Field f : allFieldsProvider.getAllFields(type)) {
                if (f.isAnnotationPresent(Id.class)) {
                    idField = f;
                    break;
                }
            }

            return idField;
        } else return null;
    }

}