package io.mateu.ijp.ui

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.chrono.IsoChronology
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeFormatterBuilder
import java.time.format.FormatStyle
import java.util.Locale
import java.util.concurrent.ConcurrentHashMap

/**
 * A date as the user writes it (D-15 / IJ-16): the ISO `2026-05-11` the wire carries read as code
 * in a listing. Mirrors the web's rule (apps/vaadin `fields/dateLocale.ts` `dateFormatSpec` +
 * `formatDateParts`): the UI's locale (the app's `AppDto.locale`, else the IDE's — [MoneyValues.uiLocale])
 * decides the ORDER of day, month and year, the separator and whether day and month are padded;
 * the year is always written with four digits ("11/5/2026" in es, "5/11/2026" in en-US,
 * "11.05.2026" in de). A date-time adds the locale's short time ("11/5/2026 9:30").
 *
 * Pure: anything that is not an ISO date (or date-time) is returned unchanged.
 */
object DateValues {

    private val DATE_TYPES = setOf("date", "localDate", "LocalDate")
    private val DATE_TIME_TYPES = setOf("dateTime", "datetime", "localDateTime", "LocalDateTime")

    /** Whether a wire dataType holds a date or a date-time. */
    fun isDateType(dataType: String): Boolean = dataType in DATE_TYPES || dataType in DATE_TIME_TYPES

    private val dateFormatters = ConcurrentHashMap<Locale, DateTimeFormatter>()
    private val timeFormatters = ConcurrentHashMap<Locale, DateTimeFormatter>()

    /** The numeric date pattern of [locale] with a 4-digit year (the web's formatDateParts). */
    internal fun datePattern(locale: Locale): String {
        val short = runCatching {
            DateTimeFormatterBuilder.getLocalizedDateTimePattern(FormatStyle.SHORT, null, IsoChronology.INSTANCE, locale)
        }.getOrNull() ?: "M/d/yy"
        // keep only the numeric parts and the first separator the user could type: "y/MM/dd", "d.M.yy"…
        val parts = Regex("d+|M+|y+|u+").findAll(short).map { it.value }.toList()
        val order = parts.map { it.first() }.distinct()
        if (order.size != 3 || parts.size != 3) return "M/d/yyyy"
        val literal = Regex("[dMyu]+([^dMyu']+)[dMyu]").find(short)?.groupValues?.get(1)?.trim() ?: "/"
        val sep = if (literal in setOf(".", "/", "-")) literal else "/"
        return parts.joinToString(sep) { p ->
            when (p.first()) {
                'y', 'u' -> "yyyy"
                'M' -> if (p.length >= 2) "MM" else "M"
                else -> if (p.length >= 2) "dd" else "d"
            }
        }
    }

    private fun dateFormatter(locale: Locale) =
        dateFormatters.computeIfAbsent(locale) { DateTimeFormatter.ofPattern(datePattern(it), it) }

    private fun timeFormatter(locale: Locale) =
        timeFormatters.computeIfAbsent(locale) { DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT).withLocale(it) }

    /** [raw] (an ISO date or date-time) in [locale]; anything else as is. */
    fun text(raw: String, locale: Locale = MoneyValues.uiLocale()): String {
        val s = raw.trim()
        if (s.length < 10 || !s[0].isDigit()) return raw
        if (s.length == 10) {
            return runCatching { LocalDate.parse(s).format(dateFormatter(locale)) }.getOrDefault(raw)
        }
        val dateTime = runCatching { LocalDateTime.parse(s) }.getOrNull()
            ?: runCatching { OffsetDateTime.parse(s).toLocalDateTime() }.getOrNull()
            ?: return raw
        val time = runCatching { dateTime.toLocalTime().format(timeFormatter(locale)) }.getOrNull()
            // a narrow no-break space (CLDR's "9:30 AM") reads oddly in a table: a plain space
            ?.replace(' ', ' ')
        val date = dateTime.toLocalDate().format(dateFormatter(locale))
        return if (time == null) date else "$date $time"
    }

    private val ISO_VALUE = Regex("""^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$""")

    /**
     * A listing cell of a column typed [dataType]: formatted when the column is a date type, or when
     * the VALUE is an ISO date / date-time. The server types a `LocalDate` listing column as a plain
     * "string" (Products → Added), so — like the numbers (IJ-07) — the value's shape decides too.
     */
    fun cellText(raw: String, dataType: String, locale: Locale = MoneyValues.uiLocale()): String = when {
        raw.isBlank() -> raw
        isDateType(dataType) || ISO_VALUE.matches(raw.trim()) -> text(raw, locale)
        else -> raw
    }
}
