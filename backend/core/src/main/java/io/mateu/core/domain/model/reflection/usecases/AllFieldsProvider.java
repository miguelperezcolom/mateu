package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.Field;
import io.mateu.core.domain.model.reflection.FieldFactory;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityManager;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Version;
import org.slf4j.Logger;
import org.springframework.stereotype.Service;

import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AllFieldsProvider {

    private final FieldFactory fieldFactory;

    public AllFieldsProvider(FieldFactory fieldFactory) {
        this.fieldFactory = fieldFactory;
    }

    //todo: cache!
    public List<Field> getAllFields(Class c) {
        List<String> vistos = new ArrayList<>();
        Map<String, java.lang.reflect.Field> originales = new HashMap<>();
        for (java.lang.reflect.Field f : c.getDeclaredFields())
            if (!Logger.class.isAssignableFrom(f.getType())) {
                if (!f.getName().contains("$")
                        && !"_proxied".equalsIgnoreCase(f.getName())
                        && !"_possibleValues".equalsIgnoreCase(f.getName())
                        && !"_binder".equalsIgnoreCase(f.getName())
                        && !"_field".equalsIgnoreCase(f.getName())) originales.put(f.getName(), f);
            }

        List<Field> l = new ArrayList<>();

        if (c.getSuperclass() != null
                && (!c.isAnnotationPresent(Entity.class)
                || c.getSuperclass().isAnnotationPresent(Entity.class)
                || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class))) {
            for (Field f : getAllFields(c.getSuperclass())) {
                if (!originales.containsKey(f.getId())) l.add(f);
                else
                    l.add(
                            fieldFactory.getFieldInterfacedFromField(
                                    originales.get(f.getName())));
                vistos.add(f.getName());
            }
        }

        for (java.lang.reflect.Field f : c.getDeclaredFields())
            if (!Modifier.isStatic(f.getModifiers()))
                if (!f.isAnnotationPresent(Version.class))
                    if (!Logger.class.isAssignableFrom(f.getType()))
                        if (!vistos.contains(f.getName()))
                            if (!f.getName().contains("$")
                                    && !"_proxied".equalsIgnoreCase(f.getName())
                                    && !"_possibleValues".equalsIgnoreCase(f.getName())
                                    && !"_binder".equalsIgnoreCase(f.getName())
                                    && !"_field".equalsIgnoreCase(f.getName())) {
                                l.add(fieldFactory.getFieldInterfacedFromField(f));
                            }

        return l;
    }

    public List<Field> getAllFields(Method m) {

        List<Field> l = new ArrayList<>();

        for (Parameter p : m.getParameters())
            if (!isInjectable(m, p)) {
                l.add(fieldFactory.getFieldInterfacedFromParameter(m, p));
            }

        return l;
    }

    private boolean isInjectable(Executable m, Parameter p) {
        boolean injectable = true;
        if (EntityManager.class.equals(p.getType())) {
        } else {
            injectable = false;
        }
        return injectable;
    }

}
