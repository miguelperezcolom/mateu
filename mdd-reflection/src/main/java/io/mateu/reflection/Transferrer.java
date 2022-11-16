package io.mateu.reflection;

import com.google.common.base.Strings;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import io.mateu.mdd.shared.annotations.KPI;
import io.mateu.mdd.shared.annotations.KPIInline;
import io.mateu.mdd.shared.annotations.Output;
import io.mateu.mdd.shared.reflection.FieldInterfaced;

import javax.persistence.EntityManager;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Type;
import java.util.*;

public class Transferrer {


    public Object transfer(EntityManager em, Object m) throws Throwable {

        Object d = em.find(m.getClass(), ReflectionHelper.getId(m));
        if (d == null) {
            d = m;
            em.persist(d);
        }

        for (FieldInterfaced f : ReflectionHelper.getAllEditableFields(m.getClass())) {
            boolean procesar = !f.isAnnotationPresent(Output.class) && !f.isAnnotationPresent(KPI.class) && !f.isAnnotationPresent(KPIInline.class);
            if (procesar) {
                Object v = ReflectionHelper.getValue(f, m);
                if (ReflectionHelper.esJpa(f)) {
                    if (v != null) {
                        if (Map.class.isAssignableFrom(f.getType())) {
                            Map l = new LinkedHashMap();
                            ((Map)v).forEach((k, o) -> {
                                Object pk = em.find(k.getClass(), ReflectionHelper.getId(k));
                                if (pk != null && ReflectionHelper.isOwner(f)) {
                                    try {
                                        pk = transfer(em, k);
                                    } catch (Throwable throwable) {
                                        throwable.printStackTrace();
                                    }
                                }

                                Object po = em.find(o.getClass(), ReflectionHelper.getId(o));
                                if (po != null && ReflectionHelper.isOwner(f)) {
                                    try {
                                        po = transfer(em, o);
                                    } catch (Throwable throwable) {
                                        throwable.printStackTrace();
                                    }
                                }

                                l.put(pk != null?pk:k, po != null?po:o);
                            });
                            if (ImmutableMap.class.isAssignableFrom(f.getType())) v = ImmutableMap.copyOf(l);
                            else v = Map.copyOf(l);
                        } else if (Collection.class.isAssignableFrom(f.getType())) {
                            List l = new ArrayList();
                            ((Collection)v).forEach(o -> {
                                Object p = em.find(o.getClass(), ReflectionHelper.getId(o));
                                if (p != null && ReflectionHelper.isOwner(f)) {
                                    try {
                                        p = transfer(em, o);
                                    } catch (Throwable throwable) {
                                        throwable.printStackTrace();
                                    }
                                }
                                l.add(p != null?p:o);
                            });
                            if (ImmutableList.class.isAssignableFrom(f.getType())) v = ImmutableList.copyOf(l);
                            else if (ImmutableSet.class.isAssignableFrom(f.getType())) v = ImmutableSet.copyOf(l);
                            else if (Set.class.isAssignableFrom(f.getType())) v = Set.copyOf(l);
                            else v = List.copyOf(l);
                        } else {
                            v = em.find(f.getType(), ReflectionHelper.getId(v));
                        }
                    }
                }
                boolean transferir = true;
                if (ReflectionHelper.esJpa(f)) {
                    Object old = ReflectionHelper.getValue(f, d);
                    if (old != null) {
                        // si es bidireccional, unreversemap valores antiguos
                        unreversemap(em, f, d, old);
                    }
                    if (v != null) {
                        // si es bidireccional, reversemap nuevos valores
                        reversemap(em, f, d, v);
                    }
                }
                if (transferir) ReflectionHelper.setValue(f, d, v);
            }
        }

        ReflectionHelper.auditar(d);
        return d;

    }

    private void reversemap(EntityManager em, FieldInterfaced f, Object bean, Object newValue) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
        if (bean != null && newValue != null) {
            FieldInterfaced rf = null;
            String mappedBy = ReflectionHelper.getMappedBy(f);
            Type targetType = f.getGenericType();
            if (Collection.class.isAssignableFrom(f.getType())) targetType = ReflectionHelper.getGenericClass(targetType);
            if (!Strings.isNullOrEmpty(mappedBy)) {
                rf = ReflectionHelper.getFieldByName((Class) targetType, mappedBy);
            } else {
                rf = ReflectionHelper.getMapper(f);
            }
            if (rf != null) {
                List otherSide = new ArrayList();
                if (newValue instanceof Collection) otherSide.addAll((Collection) newValue);
                else otherSide.add(newValue);
                FieldInterfaced finalRf = rf;
                otherSide.forEach(i -> {
                    try {
                        if (Collection.class.isAssignableFrom(finalRf.getType())) {
                            Collection v = (Collection) ReflectionHelper.getValue(finalRf, i);
                            if (v != null && !v.contains(bean)) v = ReflectionHelper.extend((Collection) v, bean);
                            else if (ImmutableList.class.isAssignableFrom(finalRf.getType())) v = ImmutableList.of(bean);
                            else if (ImmutableSet.class.isAssignableFrom(finalRf.getType())) v = ImmutableSet.of(bean);
                            else if (Set.class.isAssignableFrom(finalRf.getType())) v = Set.of(bean);
                            else v = List.of(bean);
                            ReflectionHelper.setValue(finalRf, i, v);
                        } else {
                            Object oldValue = ReflectionHelper.getValue(finalRf, i);
                            unreversemap(em, finalRf, i, oldValue);
                            ReflectionHelper.setValue(finalRf, i, bean);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
            }
        }}

    private void unreversemap(EntityManager em, FieldInterfaced f, Object bean, Object oldValue) throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {
        if (bean != null && oldValue != null) {
            FieldInterfaced rf = null;
            String mappedBy = ReflectionHelper.getMappedBy(f);
            Type targetType = f.getGenericType();
            if (Collection.class.isAssignableFrom(f.getType())) targetType = ReflectionHelper.getGenericClass(targetType);
            if (!Strings.isNullOrEmpty(mappedBy)) {
                rf = ReflectionHelper.getFieldByName((Class) targetType, mappedBy);
            } else {
                rf = ReflectionHelper.getMapper(f);
            }
            if (rf != null) {
                if (!ReflectionHelper.isOwner(f)) {
                    List otherSide = new ArrayList();
                    if (oldValue instanceof Collection) otherSide.addAll((Collection) oldValue);
                    else otherSide.add(oldValue);
                    FieldInterfaced finalRf = rf;
                    otherSide.forEach(i -> {
                        try {
                            if (Collection.class.isAssignableFrom(finalRf.getType())) {
                                Collection v = (Collection) ReflectionHelper.getValue(finalRf, i);
                                if (v != null && v.contains(bean)) v = ReflectionHelper.remove((Collection) v, bean);
                                ReflectionHelper.setValue(finalRf, i, v);
                            } else {
                                ReflectionHelper.setValue(finalRf, i, null);
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    });
                }
            }
        }
    }


}
