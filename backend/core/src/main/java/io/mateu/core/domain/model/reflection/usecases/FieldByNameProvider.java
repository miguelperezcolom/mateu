package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.FieldInterfaced;
import org.springframework.stereotype.Service;

@Service
public class FieldByNameProvider {

    private final AllFieldsProvider allFieldsProvider;

    public FieldByNameProvider(AllFieldsProvider allFieldsProvider) {
        this.allFieldsProvider = allFieldsProvider;
    }

    public FieldInterfaced getFieldByName(Class sourceClass, String fieldName) {
        FieldInterfaced field = null;
        String fn = fieldName.split("\\.")[0];
        for (FieldInterfaced f : allFieldsProvider.getAllFields(sourceClass)) {
            if (fn.equals(f.getName())) {
                if (fn.equals(fieldName)) {
                    field = f;
                } else {
                    field = getFieldByName(f.getType(), fieldName.substring(fn.length() + 1));
                }
                break;
            }
        }
        // if (field == null) log.warn("No field " + fieldName + " at " + sourceClass);
        return field;
    }
}
