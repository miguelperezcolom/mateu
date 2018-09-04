package io.mateu.mdd.core.reflection;

import org.apache.commons.beanutils.Converter;
import org.apache.commons.beanutils.converters.AbstractConverter;
import org.apache.commons.beanutils.converters.URLConverter;

import java.net.URL;

public class MiURLConverter extends AbstractConverter {
    public MiURLConverter() {
    }

    public MiURLConverter(Object defaultValue) {
        super(defaultValue);
    }

    protected Class<?> getDefaultType() {
        return URL.class;
    }

    @Override
    public <T> T convert(Class<T> type, Object value) {
        if (value == null) return null;
        return super.convert(type, value);
    }

    protected <T> T convertToType(Class<T> type, Object value) throws Throwable {
        if (URL.class.equals(type)) {
            return type.cast(new URL(value.toString()));
        } else {
            throw this.conversionException(type, value);
        }
    }
}
