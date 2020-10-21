package io.mateu.mdd.shared.reflection;

import com.google.common.base.Strings;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.interfaces.PushWriter;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.persistence.JPAHelper;

import javax.persistence.Entity;
import javax.persistence.EntityManager;
import javax.persistence.Query;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.util.*;

public class CoreReflectionHelper {

    public static Object invokeInjectableParametersOnly(Method method, Object instance) throws Throwable {
        return execute(method, new Object(), instance, null);
    }


    public static Object execute(Method m, Object parameters, Object instance, Set pendingSelection) throws Throwable {
        Object o = parameters;
        Map<String, Object> params = null;
        if (o != null && Map.class.isAssignableFrom(o.getClass())) {
            params = (Map<String, Object>) o;
        } else if (o != null) {
            params = new HashMap<>();
            for (FieldInterfaced f : ReflectionHelper.getAllEditableFields(o.getClass())) {
                params.put(f.getName(), ReflectionHelper.getValue(f, o));
            }
        }

        int posEM = -1;

        List<Object> vs = new ArrayList<>();
        int pos = 0;
        for (Parameter p : m.getParameters()) {
            Class<?> pgc = ReflectionHelper.getGenericClass(p.getParameterizedType());

            if (EntityManager.class.equals(p.getType())) {
                posEM = pos;
            } else if (PushWriter.class.equals(p.getType())) {
                vs.add(new PushWriter() {
                    @Override
                    public void push(String message) {
                        MDDUIAccessor.push(message);
                    }

                    @Override
                    public void done(String message) {
                        MDDUIAccessor.pushDone(message);
                    }
                });
            } else if (((instance instanceof RpcView || Modifier.isStatic(m.getModifiers())) && Set.class.isAssignableFrom(p.getType()) && (m.getDeclaringClass().equals(pgc)
                    || (instance instanceof RpcView && ReflectionHelper.getGenericClass(instance.getClass(), RpcView.class, "C").equals(pgc))))
                    || (pendingSelection != null && Set.class.isAssignableFrom(p.getType()) && !Strings.isNullOrEmpty(m.getAnnotation(Action.class).attachToField()))
            ) {
                vs.add(pendingSelection);
            } else if (params != null && params.containsKey(p.getName())) {
                vs.add(params.get(p.getName()));
            } else if (o != null && ReflectionHelper.getFieldByName(o.getClass(), p.getName()) != null) {
                vs.add(ReflectionHelper.getValue(ReflectionHelper.getFieldByName(o.getClass(), p.getName()), o));
            } else {
                Object v = null;
                if (int.class.equals(p.getType())) v = 0;
                if (long.class.equals(p.getType())) v = 0l;
                if (float.class.equals(p.getType())) v = 0f;
                if (double.class.equals(p.getType())) v = 0d;
                if (boolean.class.equals(p.getType())) v = false;
                vs.add(v);
            }
            pos++;
        }

        if (posEM >= 0) {

            Object[] r = {null};

            int finalPosEM = posEM;
            Object finalInstance = instance;

            JPAHelper.transact( em -> {

                vs.add(finalPosEM, em);

                for (Object p : vs) {
                    if (p instanceof Set) {
                        Set s = (Set) p;
                        Set<Object> aux = new HashSet<>();
                        for (Object i : s) {
                            if (i != null && i.getClass().isAnnotationPresent(Entity.class)) {
                                aux.add(em.find(i.getClass(), ReflectionHelper.getId(i)));
                            } else aux.add(i);
                        }
                        s.clear();
                        s.addAll(aux);
                    }
                }

                List<Object> aux = new ArrayList<>();
                for (Object i : vs) {
                    if (i != null && i.getClass().isAnnotationPresent(Entity.class)) {
                        aux.add(em.find(i.getClass(), ReflectionHelper.getId(i)));
                    } else aux.add(i);
                }
                vs.clear();
                vs.addAll(aux);


                Object[] args = vs.toArray();
                Object i = finalInstance;
                if (!Modifier.isStatic(m.getModifiers())) i = ReflectionHelper.newInstance(m.getDeclaringClass());
                r[0] = m.invoke(i, args);

                if (r[0] != null && r[0] instanceof Query) r[0] = ((Query)r[0]).getResultList();

            });

            return r[0];

        } else {

            Object[] args = vs.toArray();
            if (!Modifier.isStatic(m.getModifiers())) instance = ReflectionHelper.newInstance(m.getDeclaringClass());
            return m.invoke(instance, args);

        }

    }



}
