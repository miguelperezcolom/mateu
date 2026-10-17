package io.mateu.core.infra.reflection;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;

/**
 * The wire shape of the date-time fields that are not a {@code LocalDateTime} — {@link Date},
 * {@link java.sql.Date} and {@link ZonedDateTime}, which {@code FieldTypeMapper} maps to {@code
 * dateTime}: a LOCAL ISO date-time ({@code 2026-10-17T10:15:30}) in the server's zone, exactly what
 * the date-time pickers read and write. The client has no notion of a zone, so the conversion
 * happens here, in both directions, with the same zone — a value round-trips to the same instant.
 *
 * <p>Parsing is lenient: a local date-time, an offset/zoned date-time, a bare date or epoch millis
 * all read as the instant they denote.
 */
public final class LegacyDateTimes {

  private LegacyDateTimes() {}

  public static boolean handles(Class<?> type) {
    return Date.class.equals(type)
        || java.sql.Date.class.equals(type)
        || ZonedDateTime.class.equals(type);
  }

  /** The wire string for a Date / java.sql.Date / ZonedDateTime value. */
  public static String format(Object value) {
    LocalDateTime local;
    if (value instanceof java.sql.Date sqlDate) {
      local = sqlDate.toLocalDate().atStartOfDay();
    } else if (value instanceof Date date) {
      local = LocalDateTime.ofInstant(date.toInstant(), zone());
    } else if (value instanceof ZonedDateTime zoned) {
      local = zoned.withZoneSameInstant(zone()).toLocalDateTime();
    } else {
      return value == null ? null : value.toString();
    }
    return local.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
  }

  /** A wire value (string or epoch millis) as an instance of {@code type}; null when blank. */
  public static Object parse(Object value, Class<?> type) {
    if (value == null || (value instanceof String s && s.isBlank())) {
      return null;
    }
    if (type.isInstance(value)) {
      return value;
    }
    var zoned = toZoned(value);
    if (ZonedDateTime.class.equals(type)) {
      return zoned;
    }
    if (java.sql.Date.class.equals(type)) {
      return java.sql.Date.valueOf(zoned.toLocalDate());
    }
    return Date.from(zoned.toInstant());
  }

  private static ZonedDateTime toZoned(Object value) {
    if (value instanceof Number millis) {
      return Instant.ofEpochMilli(millis.longValue()).atZone(zone());
    }
    if (value instanceof Date date) {
      return date.toInstant().atZone(zone());
    }
    var text = value.toString().trim();
    try {
      return LocalDateTime.parse(text).atZone(zone());
    } catch (DateTimeParseException notLocal) {
      // fall through
    }
    try {
      return OffsetDateTime.parse(text).atZoneSameInstant(zone());
    } catch (DateTimeParseException notOffset) {
      // fall through
    }
    try {
      return ZonedDateTime.parse(text).withZoneSameInstant(zone());
    } catch (DateTimeParseException notZoned) {
      // fall through
    }
    return LocalDate.parse(text).atStartOfDay(zone());
  }

  private static ZoneId zone() {
    return ZoneId.systemDefault();
  }
}
