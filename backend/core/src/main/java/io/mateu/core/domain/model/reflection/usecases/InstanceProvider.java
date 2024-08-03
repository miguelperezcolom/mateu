package io.mateu.core.domain.model.reflection.usecases;

import io.mateu.core.domain.model.reflection.FieldInterfaced;
import io.mateu.core.infra.MateuConfiguratorBean;
import jakarta.validation.constraints.NotNull;
import org.springframework.stereotype.Service;

import java.lang.reflect.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class InstanceProvider {

    List<Class> notFromString = new ArrayList<>();

    private final MateuConfiguratorBean beanProvider;
    private final FieldByNameProvider fieldByNameProvider;
    private final ValueProvider valueProvider;
    private final ValueWriter valueWriter;
    private final AllFieldsProvider allFieldsProvider;

    public InstanceProvider(MateuConfiguratorBean beanProvider, FieldByNameProvider fieldByNameProvider, ValueProvider valueProvider, ValueWriter valueWriter, AllFieldsProvider allFieldsProvider) {
        this.beanProvider = beanProvider;
        this.fieldByNameProvider = fieldByNameProvider;
        this.valueProvider = valueProvider;
        this.valueWriter = valueWriter;
        this.allFieldsProvider = allFieldsProvider;
    }

    public <T> T newInstance(Class<T> c)
            throws NoSuchMethodException,
            IllegalAccessException,
            InvocationTargetException,
            InstantiationException {
        Object o = null;
        if (!notFromString.contains(c)) {
            // intentar recuperar del contexto
            o = beanProvider.getBean(c);
        }
        if (o == null) { // no viene de spring
            if (c.getDeclaringClass() != null) { // caso inner class
                Object p = newInstance(c.getDeclaringClass());
                Constructor<?> cons =
                        Arrays.stream(c.getDeclaredConstructors())
                                .filter(constructor -> constructor.getParameterCount() == 1)
                                .findFirst()
                                .get();
                cons.setAccessible(true);
                o = cons.newInstance(p);
            } else {
                Constructor con = getConstructor(c);
                if (con != null) {
                    o = con.newInstance();
                } else {
                    Method builderMethod = null;
                    try {
                        builderMethod = c.getMethod("builder");
                    } catch (Exception ignored) {

                    }
                    if (builderMethod != null) {
                        Object builder = c.getMethod("builder").invoke(null);
                        o = builder.getClass().getMethod("build").invoke(builder);
                    } else {
                        if (c.getDeclaredConstructors().length == 1) {
                            Constructor constructor = c.getDeclaredConstructors()[0];
                            o = constructor.newInstance(newInstance(constructor.getParameterTypes()[0]));
                        }
                    }
                }
            }
            notFromString.add(c);
        }
        return (T) o;
    }

    public Object newInstance(Class c, Object parent)
            throws IllegalAccessException,
            InstantiationException,
            InvocationTargetException,
            NoSuchMethodException {
        Object i = null;
        if (parent != null) {
            Constructor con = getConstructor(c, parent.getClass());
            if (con != null) i = con.newInstance(parent);
            else {
                con =
                        Arrays.stream(c.getDeclaredConstructors())
                                .filter(x -> x.getParameterCount() == 0)
                                .findFirst()
                                .orElse(null);
                if (!Modifier.isPublic(con.getModifiers())) con.setAccessible(true);
                i = con.newInstance();
                for (FieldInterfaced f : allFieldsProvider.getAllFields(c))
                    if (f.getType().equals(parent.getClass()) && f.isAnnotationPresent(NotNull.class)) {
                        valueWriter.setValue(f, i, parent);
                        break;
                    }
            }
        } else {
            Constructor con = getConstructor(c);
            if (con != null) {
                i = con.newInstance();
            } else if (c.getMethod("builder") != null) {
                Object builder = c.getMethod("builder").invoke(null);
                i = builder.getClass().getMethod("build").invoke(builder);
            }
        }
        return i;
    }


    public Object newInstance(Constructor c, Object params) throws Throwable {
        List<Object> vs = new ArrayList<>();
        for (Parameter p : c.getParameters()) {
            if (params != null && fieldByNameProvider.getFieldByName(params.getClass(), p.getName()) != null) {
                vs.add(valueProvider.getValue(fieldByNameProvider.getFieldByName(params.getClass(), p.getName()), params));
            } else {
                Object v = null;
                if (int.class.equals(p.getType())) v = 0;
                if (long.class.equals(p.getType())) v = 0l;
                if (float.class.equals(p.getType())) v = 0f;
                if (double.class.equals(p.getType())) v = 0d;
                if (boolean.class.equals(p.getType())) v = false;
                vs.add(v);
            }
        }
        Object[] args = vs.toArray();
        return c.newInstance(args);
    }

    private Constructor getConstructor(Class type) {
        Constructor con = null;
        int minParams = Integer.MAX_VALUE;
        for (Constructor x : type.getConstructors())
            if (Modifier.isPublic(x.getModifiers())) {
                if (x.getParameterCount() < minParams) {
                    con = x;
                    minParams = con.getParameterCount();
                }
            }
        return con;
    }

    private Constructor getConstructor(Class c, Class parameterClass) {
        Constructor con = null;
        while (con == null && !Object.class.equals(parameterClass)) {
            try {
                con = c.getConstructor(parameterClass);
            } catch (NoSuchMethodException e) {
            }
            if (con == null) {
                parameterClass = parameterClass.getSuperclass();
            }
        }
        return con;
    }


}
