package io.mateu.mdd.core.model.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Created by miguel on 12/10/16.
 */
@Converter(autoApply = true)
public class LocalTimeAttributeConverter implements AttributeConverter<LocalTime, Timestamp> {

    @Override
    public Timestamp convertToDatabaseColumn(LocalTime locDateTime) {
        return (locDateTime == null ? null : Timestamp.valueOf(locDateTime.atDate(LocalDate.of(2000, 1, 1))));
    }

    @Override
    public LocalTime convertToEntityAttribute(Timestamp sqlTimestamp) {
        return (sqlTimestamp == null ? null : sqlTimestamp.toLocalDateTime().toLocalTime());
    }
}
