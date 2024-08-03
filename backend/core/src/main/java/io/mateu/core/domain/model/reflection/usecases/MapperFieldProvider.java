package io.mateu.core.domain.model.reflection.usecases;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.reflection.FieldInterfaced;
import jakarta.persistence.*;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

@Service
public class MapperFieldProvider {

    private final FieldByNameProvider fieldByNameProvider;
    private final AllFieldsProvider allFieldsProvider;
    private final GenericClassProvider genericClassProvider;

    public MapperFieldProvider(FieldByNameProvider fieldByNameProvider, AllFieldsProvider allFieldsProvider, GenericClassProvider genericClassProvider) {
        this.fieldByNameProvider = fieldByNameProvider;
        this.allFieldsProvider = allFieldsProvider;
        this.genericClassProvider = genericClassProvider;
    }

    public FieldInterfaced getMapper(FieldInterfaced field) {

        // field es el campo original

        // mapper será la contraparte en el destino
        FieldInterfaced mapper = null;

        // buscamos el nombre del campo mapper en el campo original
        String mfn = null;
        if (field.isAnnotationPresent(OneToOne.class))
            mfn = field.getAnnotation(OneToOne.class).mappedBy();
        else if (field.isAnnotationPresent(OneToMany.class))
            mfn = field.getAnnotation(OneToMany.class).mappedBy();
        else if (field.isAnnotationPresent(ManyToMany.class))
            mfn = field.getAnnotation(ManyToMany.class).mappedBy();
        else if (field.isAnnotationPresent(ManyToOne.class)) {

            // si es un campo many to one, entonces no tenemos atributo mappedBy en el origen y debemos
            // buscar un campo en la contraparte con el atributo mappedBy

            for (FieldInterfaced f : allFieldsProvider.getAllFields(field.getType())) {
                String z = null;
                if (f.isAnnotationPresent(OneToOne.class)) z = f.getAnnotation(OneToOne.class).mappedBy();
                else if (f.isAnnotationPresent(OneToMany.class))
                    z = f.getAnnotation(OneToMany.class).mappedBy();
                else if (f.isAnnotationPresent(ManyToMany.class))
                    z = f.getAnnotation(ManyToMany.class).mappedBy();
                // debe coincidir el nombre y el tipo
                if (field.getName().equals(z)
                        && (field.getDeclaringClass().equals(f.getType())
                        || field.getDeclaringClass().equals(genericClassProvider.getGenericClass(f.getGenericType())))) {
                    mfn = f.getName();
                    break;
                }
            }
        }

        Class targetClass = null;
        if (Collection.class.isAssignableFrom(field.getType())
                || Set.class.isAssignableFrom(field.getType())) {
            targetClass = field.getGenericClass();
        } else if (Map.class.isAssignableFrom(field.getType())) {
            targetClass = genericClassProvider.getGenericClass(field, Map.class, "V");
        } else {
            targetClass = field.getType();
        }

        if (!Strings.isNullOrEmpty(mfn)) {
            mapper = fieldByNameProvider.getFieldByName(targetClass, mfn);

        } else {

            if (targetClass.isAnnotationPresent(Entity.class))
                for (FieldInterfaced f : allFieldsProvider.getAllFields(targetClass)) {
                    mfn = null;
                    if (f.isAnnotationPresent(OneToOne.class))
                        mfn = f.getAnnotation(OneToOne.class).mappedBy();
                    else if (f.isAnnotationPresent(OneToMany.class))
                        mfn = f.getAnnotation(OneToMany.class).mappedBy();
                    else if (f.isAnnotationPresent(ManyToMany.class))
                        mfn = f.getAnnotation(ManyToMany.class).mappedBy();

                    if (field.getName().equals(mfn)) {

                        Class reverseClass = null;
                        if (Collection.class.isAssignableFrom(f.getType())
                                || Set.class.isAssignableFrom(f.getType())) {
                            reverseClass = f.getGenericClass();
                        } else if (Map.class.isAssignableFrom(field.getType())) {
                            reverseClass = genericClassProvider.getGenericClass(f, Map.class, "V");
                        } else {
                            reverseClass = f.getType();
                        }

                        if (reverseClass != null && field.getDeclaringClass().isAssignableFrom(reverseClass)) {
                            mapper = f;
                            break;
                        }
                    }
                }
        }

        return mapper;
    }

}
