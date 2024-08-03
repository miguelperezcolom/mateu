package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.FieldInterfaced;
import io.mateu.core.domain.model.reflection.FieldInterfacedFactory;
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

    private final FieldInterfacedFactory fieldInterfacedFactory;

    public AllFieldsProvider(FieldInterfacedFactory fieldInterfacedFactory) {
        this.fieldInterfacedFactory = fieldInterfacedFactory;
    }

    //todo: cache!
    public List<FieldInterfaced> getAllFields(Class c) {
        List<String> vistos = new ArrayList<>();
        Map<String, Field> originales = new HashMap<>();
        for (Field f : c.getDeclaredFields())
            if (!Logger.class.isAssignableFrom(f.getType())) {
                if (!f.getName().contains("$")
                        && !"_proxied".equalsIgnoreCase(f.getName())
                        && !"_possibleValues".equalsIgnoreCase(f.getName())
                        && !"_binder".equalsIgnoreCase(f.getName())
                        && !"_field".equalsIgnoreCase(f.getName())) originales.put(f.getName(), f);
            }

        List<FieldInterfaced> l = new ArrayList<>();

        if (c.getSuperclass() != null
                && (!c.isAnnotationPresent(Entity.class)
                || c.getSuperclass().isAnnotationPresent(Entity.class)
                || c.getSuperclass().isAnnotationPresent(MappedSuperclass.class))) {
            for (FieldInterfaced f : getAllFields(c.getSuperclass())) {
                if (!originales.containsKey(f.getId())) l.add(f);
                else
                    l.add(
                            fieldInterfacedFactory.getFieldInterfacedFromField(
                                    originales.get(f.getName())));
                vistos.add(f.getName());
            }
        }

        for (Field f : c.getDeclaredFields())
            if (!Modifier.isStatic(f.getModifiers()))
                if (!f.isAnnotationPresent(Version.class))
                    if (!Logger.class.isAssignableFrom(f.getType()))
                        if (!vistos.contains(f.getName()))
                            if (!f.getName().contains("$")
                                    && !"_proxied".equalsIgnoreCase(f.getName())
                                    && !"_possibleValues".equalsIgnoreCase(f.getName())
                                    && !"_binder".equalsIgnoreCase(f.getName())
                                    && !"_field".equalsIgnoreCase(f.getName())) {
                                l.add(fieldInterfacedFactory.getFieldInterfacedFromField(f));
                            }

        return l;
    }

    public List<FieldInterfaced> getAllFields(Method m) {

        List<FieldInterfaced> l = new ArrayList<>();

        for (Parameter p : m.getParameters())
            if (!isInjectable(m, p)) {
                l.add(fieldInterfacedFactory.getFieldInterfacedFromParameter(m, p));
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
