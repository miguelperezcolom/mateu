package io.mateu.domain.uidefinition.core.model.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.sql.Date;
import java.time.LocalDate;

/** Created by miguel on 12/10/16. */
@Converter(autoApply = true)
public class LocalDateAttributeConverter implements AttributeConverter<LocalDate, Date> {

  @Override
  public Date convertToDatabaseColumn(LocalDate locDate) {
    return (locDate == null ? null : Date.valueOf(locDate));
  }

  @Override
  public LocalDate convertToEntityAttribute(Date sqlDate) {
    return (sqlDate == null ? null : sqlDate.toLocalDate());
  }
}
