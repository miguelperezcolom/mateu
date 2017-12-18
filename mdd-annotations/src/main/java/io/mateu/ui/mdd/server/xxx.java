package io.mateu.ui.mdd.server;

import javax.ws.rs.ext.ParamConverter;
import javax.ws.rs.ext.ParamConverterProvider;
import javax.ws.rs.ext.Provider;
import java.lang.annotation.Annotation;
import java.lang.reflect.Type;

@Provider
public class xxx implements ParamConverterProvider {
    @Override
    public <T> ParamConverter<T> getConverter(Class<T> rawType, Type genericType, Annotation[] annotations) {
        if (rawType.getName().equals(Class.class.getName())) {
            return new ParamConverter<T>() {

                @SuppressWarnings("unchecked")
                @Override
                public T fromString(String value) {
                    Class dateParamModel = null;
                    try {
                        dateParamModel = Class.forName(value);
                    } catch (ClassNotFoundException e) {
                        e.printStackTrace();
                    }
                    return (T) dateParamModel;
                }

                @Override
                public String toString(T bean) {
                    return ((Class) bean).getName();
                }

            };
        }

        return null;
    }
}
