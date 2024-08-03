package io.mateu.core.domain.model.reflection.usecases;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.reflection.FieldInterfaced;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import jakarta.persistence.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AllEditableFieldsProvider {

    private final AllFieldsProvider allFieldsProvider;
    private final MethodProvider methodProvider;
    private final GetterProvider getterProvider;

    public AllEditableFieldsProvider(AllFieldsProvider allFieldsProvider, MethodProvider methodProvider, GetterProvider getterProvider) {
        this.allFieldsProvider = allFieldsProvider;
        this.methodProvider = methodProvider;
        this.getterProvider = getterProvider;
    }

    public List<FieldInterfaced> getAllEditableFields(
            Class modelType, Class superType, boolean includeReverseMappers, FieldInterfaced field) {
        List<FieldInterfaced> allFields = allFieldsProvider.getAllFields(modelType);

        if (field != null && field.isAnnotationPresent(FieldsFilter.class)) {

            List<String> fns = Arrays.asList(field.getAnnotation(FieldsFilter.class).value().split(","));

            List<FieldInterfaced> borrar = new ArrayList<>();
            for (FieldInterfaced f : allFields) {
                if (!fns.contains(f.getName())) {
                    borrar.add(f);
                }
            }
            allFields.removeAll(borrar);
        }

        allFields = filterAccesible(allFields);

        allFields = filterMenuFields(allFields);

        allFields = filterInjected(allFields);

        // todo: ver como resolvemos esto
        boolean isEditingNewRecord = false;

        allFields =
                allFields.stream()
                        .filter(
                                (f) ->
                                        !(f.isAnnotationPresent(Version.class)
                                                || f.isAnnotationPresent(Ignored.class)
                                                || f.isAnnotationPresent(KPI.class)
                                                || f.isAnnotationPresent(NotInEditor.class)
                                                || (f.isAnnotationPresent(Id.class)
                                                && f.isAnnotationPresent(GeneratedValue.class))
                                                || (f.isAnnotationPresent(NotWhenCreating.class) && isEditingNewRecord)
                                                || (f.isAnnotationPresent(NotWhenEditing.class) && !isEditingNewRecord)))
                        .collect(Collectors.toList());

        if (superType != null && !includeReverseMappers) {

            List<FieldInterfaced> manytoones =
                    allFields.stream()
                            .filter(f -> f.isAnnotationPresent(ManyToOne.class))
                            .collect(Collectors.toList());

            for (FieldInterfaced manytoonefield : manytoones)
                if (superType.equals(manytoonefield.getType())) {

                    for (FieldInterfaced parentField : allFieldsProvider.getAllFields(manytoonefield.getType())) {
                        // quitamos el campo mappedBy de las columnas, ya que se supone que siempre seremos
                        // nosotros
                        OneToMany aa;
                        if ((aa = parentField.getAnnotation(OneToMany.class)) != null) {

                            String mb = parentField.getAnnotation(OneToMany.class).mappedBy();

                            if (!Strings.isNullOrEmpty(mb)) {
                                FieldInterfaced mbf = null;
                                for (FieldInterfaced f : allFields) {
                                    if (f.getName().equals(mb)) {
                                        mbf = f;
                                        break;
                                    }
                                }
                                if (mbf != null) {
                                    allFields.remove(mbf);
                                    break;
                                }
                            }
                        }
                    }
                }
        }

        for (FieldInterfaced f : new ArrayList<>(allFields))
            if (f.isAnnotationPresent(Position.class)) {
                allFields.remove(f);
                allFields.add(f.getAnnotation(Position.class).value(), f);
            }

        return allFields;
    }


    private List<FieldInterfaced> filterMenuFields(List<FieldInterfaced> allFields) {
        List<FieldInterfaced> r = new ArrayList<>();
        for (FieldInterfaced f : allFields) {
            if (!f.isAnnotationPresent(MenuOption.class) && !f.isAnnotationPresent(Submenu.class))
                r.add(f);
        }
        return r;
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
