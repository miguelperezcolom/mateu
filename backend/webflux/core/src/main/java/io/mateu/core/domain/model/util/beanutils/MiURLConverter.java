package io.mateu.core.domain.model.util.beanutils;

import java.net.URL;
import org.apache.commons.beanutils.converters.AbstractConverter;

/** Converter for URLs. We want to convert it to a simple String and vice versa. */
public class MiURLConverter extends AbstractConverter {
  public MiURLConverter() {}

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
