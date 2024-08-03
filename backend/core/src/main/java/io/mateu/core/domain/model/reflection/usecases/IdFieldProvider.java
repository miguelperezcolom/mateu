package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.FieldInterfaced;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import org.springframework.stereotype.Service;

@Service
public class IdFieldProvider {

    private final AllFieldsProvider allFieldsProvider;

    public IdFieldProvider(AllFieldsProvider allFieldsProvider) {
        this.allFieldsProvider = allFieldsProvider;
    }

    public FieldInterfaced getIdField(Class type) {
        if (type.isAnnotationPresent(Entity.class)) {
            FieldInterfaced idField = null;

            for (FieldInterfaced f : allFieldsProvider.getAllFields(type)) {
                if (f.isAnnotationPresent(Id.class)) {
                    idField = f;
                    break;
                }
            }

            return idField;
        } else return null;
    }

}
