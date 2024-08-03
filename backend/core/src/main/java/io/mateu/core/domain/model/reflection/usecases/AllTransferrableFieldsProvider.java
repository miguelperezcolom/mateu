package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.FieldInterfaced;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

@Service
public class AllTransferrableFieldsProvider {

    private final AllFieldsProvider allFieldsProvider;
    private final MethodProvider methodProvider;
    private final GetterProvider getterProvider;


    public AllTransferrableFieldsProvider(AllFieldsProvider allFieldsProvider, MethodProvider methodProvider, GetterProvider getterProvider) {
        this.allFieldsProvider = allFieldsProvider;
        this.methodProvider = methodProvider;
        this.getterProvider = getterProvider;
    }

    public List<FieldInterfaced> getAllTransferrableFields(Class modelType) {
        List<FieldInterfaced> allFields = allFieldsProvider.getAllFields(modelType);

        allFields = filterAccesible(allFields);

        allFields = filterInjected(allFields);

        return allFields;
    }

    private List<FieldInterfaced> filterAccesible(List<FieldInterfaced> allFields) {
        List<FieldInterfaced> r = new ArrayList<>();
        for (FieldInterfaced f : allFields) {
            if (hasGetter(f)) r.add(f);
        }
        return r;
    }

    private List<FieldInterfaced> filterInjected(List<FieldInterfaced> allFields) {
        List<FieldInterfaced> r = new ArrayList<>();
        for (FieldInterfaced f : allFields) {
            if (!f.isAnnotationPresent(Autowired.class) && !Modifier.isFinal(f.getModifiers())) r.add(f);
        }
        return r;
    }

    public boolean hasGetter(FieldInterfaced f) {
        return methodProvider.getMethod(f.getDeclaringClass(), getterProvider.getGetter(f)) != null;
    }

}
