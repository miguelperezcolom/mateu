package io.mateu.core.domain;

import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.HasInitMethod;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import reactor.core.publisher.Mono;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.Parameter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.apache.commons.beanutils.ConvertUtils.convert;

@Named
@RequiredArgsConstructor
public class ReflectionInstanceFactory implements InstanceFactory {

    private final BasicTypeChecker basicTypeChecker;
    private final BeanProvider beanProvider;

    @SneakyThrows
    @Override
    public Mono<? extends Object> createInstance(String className, Map<String, Object> data, HttpRequest httpRequest) {
        return Mono.just(Class.forName(className))
                .map(uiClass -> newInstance(uiClass, data))
                .map(uiInstance -> initIfNeeded(uiInstance, httpRequest));
    }

    private Object initIfNeeded(Object uiInstance, HttpRequest httpRequest) {
        if (uiInstance instanceof HasInitMethod hasInitMethod) {
            hasInitMethod.init(httpRequest);
        }
        return uiInstance;
    }

    public <T> T newInstance(Class c)
            throws NoSuchMethodException,
            IllegalAccessException,
            InvocationTargetException,
            InstantiationException {
        return (T) newInstance(c, Map.of());
    }

    @SneakyThrows
    public <T> T newInstance(Class<T> c, Map<String, Object> data) {
        var o = beanProvider.getBean(c);
        if (o == null) { // not from spring
            if (c.getDeclaringClass() != null) { // inner class
                Object p = newInstance(c.getDeclaringClass());
                Constructor<?> cons =
                        Arrays.stream(c.getDeclaredConstructors())
                                .filter(constructor -> constructor.getParameterCount() == 1)
                                .findFirst()
                                .get();
                cons.setAccessible(true);
                o = (T) cons.newInstance(p);
            } else {
                Constructor con = getConstructor(c);
                if (con != null) {
                    if (con.getParameterCount() > 0) {
                        o = (T) con.newInstance(buildConstructorParams(con, data));
                    } else {
                        o = (T) con.newInstance();
                    }
                } else {
                    Method builderMethod = null;
                    try {
                        builderMethod = c.getMethod("builder");
                    } catch (Exception ignored) {

                    }
                    if (builderMethod != null) {
                        Object builder = c.getMethod("builder").invoke(null);
                        o = (T) builder.getClass().getMethod("build").invoke(builder);
                    } else {
                        if (c.getDeclaredConstructors().length == 1) {
                            Constructor constructor = c.getDeclaredConstructors()[0];
                            o = (T) constructor.newInstance(newInstance(constructor.getParameterTypes()[0]));
                        }
                    }
                }
            }
        }
        return (T) o;
    }

    private Object[] buildConstructorParams(Constructor con, Map<String, Object> data)
            throws InvocationTargetException,
            IllegalAccessException,
            InstantiationException,
            NoSuchMethodException {
        List<Object> params = new ArrayList<>();
        for (Parameter parameter : con.getParameters()) {
            if (basicTypeChecker.isBasic(parameter.getType())) {
                if (LocalDate.class.equals(parameter.getType())) {
                    params.add(LocalDate.parse(convert(data.get(parameter.getName()))));
                } else if (LocalDateTime.class.equals(parameter.getType())) {
                    params.add(LocalDateTime.parse(convert(data.get(parameter.getName()))));
                } else {
                    params.add(convert(data.get(parameter.getName()), parameter.getType()));
                }
            } else {
                params.add(
                        newInstance(
                                parameter.getType(),
                                (Map<String, Object>) data.getOrDefault(parameter.getName(), Map.of())));
            }
        }
        return params.toArray();
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
        if (con == null) {
            for (Constructor x : type.getConstructors())
                if (Modifier.isProtected(x.getModifiers())) {
                    if (x.getParameterCount() < minParams) {
                        con = x;
                        minParams = con.getParameterCount();
                    }
                }
        }
        if (con == null) {
            for (Constructor x : type.getDeclaredConstructors())
                if (Modifier.isPublic(x.getModifiers())) {
                    if (x.getParameterCount() < minParams) {
                        con = x;
                        minParams = con.getParameterCount();
                    }
                }
        }
        if (con == null) {
            for (Constructor x : type.getDeclaredConstructors())
                if (Modifier.isProtected(x.getModifiers())) {
                    if (x.getParameterCount() < minParams) {
                        con = x;
                        minParams = con.getParameterCount();
                    }
                }
        }
        if (con == null) {
            for (Constructor x : type.getDeclaredConstructors())
                if (x.getParameterCount() < minParams) {
                    con = x;
                    minParams = con.getParameterCount();
                }
        }
        if (con != null) {
            if (!Modifier.isPublic(con.getModifiers())) {
                con.setAccessible(true);
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
