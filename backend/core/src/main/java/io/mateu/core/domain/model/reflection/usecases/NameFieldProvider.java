package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.FieldInterfaced;
import io.mateu.core.domain.uidefinition.shared.annotations.LabelFieldForLists;
import jakarta.persistence.Id;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;

@Service
public class NameFieldProvider {

    private final MethodProvider methodProvider;
    private final AllFieldsProvider allFieldsProvider;

    public NameFieldProvider(MethodProvider methodProvider, AllFieldsProvider allFieldsProvider) {
        this.methodProvider = methodProvider;
        this.allFieldsProvider = allFieldsProvider;
    }

    public FieldInterfaced getNameField(Class entityClass, boolean toStringPreferred) {
        FieldInterfaced fName = null;
        Method toStringMethod = methodProvider.getMethod(entityClass, "toString");
        boolean toStringIsOverriden =
                toStringMethod != null && toStringMethod.getDeclaringClass().equals(entityClass);
        if (!toStringPreferred || !toStringIsOverriden) {
            boolean hayName = false;
            for (FieldInterfaced ff : allFieldsProvider.getAllFields(entityClass))
                if (ff.isAnnotationPresent(LabelFieldForLists.class)) {
                    fName = ff;
                    hayName = true;
                }
            if (!hayName) {
                for (FieldInterfaced ff : allFieldsProvider.getAllFields(entityClass))
                    if ("name".equalsIgnoreCase(ff.getName()) || "nombre".equalsIgnoreCase(ff.getName())) {
                        fName = ff;
                        hayName = true;
                    }
            }
            if (!hayName) {
                for (FieldInterfaced ff : allFieldsProvider.getAllFields(entityClass))
                    if ("value".equalsIgnoreCase(ff.getName())
                            || "title".equalsIgnoreCase(ff.getName())
                            || "titulo".equalsIgnoreCase(ff.getName())
                            || "description".equalsIgnoreCase(ff.getName())
                            || "descripcion".equalsIgnoreCase(ff.getName())) {
                        fName = ff;
                        hayName = true;
                    }
            }
            if (!hayName) {
                for (FieldInterfaced ff : allFieldsProvider.getAllFields(entityClass))
                    if ("description".equalsIgnoreCase(ff.getName())
                            || "descripcion".equalsIgnoreCase(ff.getName())) {
                        fName = ff;
                        hayName = true;
                    }
            }
            if (!hayName) {
                for (FieldInterfaced ff : allFieldsProvider.getAllFields(entityClass))
                    if (ff.isAnnotationPresent(Id.class)) {
                        fName = ff;
                    }
            }
        }
        return fName;
    }

}
