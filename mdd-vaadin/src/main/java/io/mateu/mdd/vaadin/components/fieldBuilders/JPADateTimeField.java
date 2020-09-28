package io.mateu.mdd.vaadin.components.fieldBuilders;

import com.vaadin.data.Result;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class JPADateTimeField extends com.vaadin.ui.DateTimeField {

    @Override
    protected Result<LocalDateTime> handleUnparsableDateString(String dateString) {
        Result<LocalDateTime> r = super.handleUnparsableDateString(dateString);
        if (r.isError()) {

            LocalDate date = null;

            if ("h".equalsIgnoreCase(dateString) || "t".equalsIgnoreCase(dateString)) {

                //todo: recordar fechas especiales, para conversión inversa
                date =  LocalDate.now();

            } else {

                String formatString = "dd/MM/yyyy";
                boolean lenient = true;
                DateTimeFormatter format = DateTimeFormatter.ofPattern(formatString);

                //todo: tener en cuenta los locales
                boolean inverso = false;
                String z = formatString.toLowerCase();
                if (z.indexOf("m") < z.indexOf("d")) inverso = true;

                LocalDate h = LocalDate.now();
                h = h.minusDays(7); // restamos 1 semana, para que no añada un año si indicamos el día de hoy

                if (dateString == null || "".equals(dateString.trim())) {
                } else if (dateString.contains("/") || dateString.contains("-")) {
                    date = LocalDate.parse(dateString, format);
                } else {
                    if (!dateString.contains(" ")) {
                        dateString = dateString.split(" ")[0].replaceAll("[^\\d]", "");
                        if (dateString.length() == 2) { // siempre es el día del mes actual
                            date = LocalDate.of(date.getYear(), date.getMonth(), Integer.parseInt(dateString));
                            if (h.isAfter(date)) date = date.plusMonths(1);
                        } else if (dateString.length() == 4) { // dia y mes del año actual
                            date = LocalDate.of(date.getYear(), Integer.parseInt(dateString.substring(2)), Integer.parseInt(dateString.substring(0, 2)));
                            if (h.isAfter(date)) date = date.plusYears(1);
                        } else if (dateString.length() == 6) { // dia, mes y año del año 20xx
                            date = LocalDate.of(2000 + Integer.parseInt(dateString.substring(6)), Integer.parseInt(dateString.substring(2, 4)), Integer.parseInt(dateString.substring(0, 2)));
                            if (h.isAfter(date)) date = date.plusYears(100);
                        } else if (dateString.length() == 8) { // dia mes y año sin separadores
                            date = LocalDate.of(Integer.parseInt(dateString.substring(6)), Integer.parseInt(dateString.substring(2, 4)), Integer.parseInt(dateString.substring(0, 2)));
                        }
                    } else {
                        String aux = dateString;
                        dateString = dateString.replaceAll("[^\\d]", "");
                                /*
                                if (dateString.length() == 2) { // siempre es el día del mes actual
                                    date = DateTimeFormat.getFormat((inverso)?"yyyyMMdd":"ddMMyyyy").parse((inverso)?"" + (1900 + h.getYear()) + ((h.getMonth() <= 10)?"0":"") + (h.getMonth() + 1) + dateString:dateString + ((h.getMonth() <= 10)?"0":"") + (h.getMonth() + 1) + (1900 + h.getYear()));
                                    if (h.getTime() > date.getTime()) date = DateTimeFormat.getFormat((inverso)?"yyyyMMdd":"ddMMyyyy").parse((inverso)?"" + (1900 + h.getYear() + 1) + ((h.getMonth() <= 10)?"0":"") + (h.getMonth() + 1) + dateString:dateString + ((h.getMonth() <= 10)?"0":"") + (h.getMonth() + 1) + (1900 + h.getYear() + 1));
                                } else if (dateString.length() == 4) { // dia y mes del año actual
                                    date = DateTimeFormat.getFormat((inverso)?"yyyyMMdd":"ddMMyyyy").parse((inverso)?"" + (1900 + h.getYear()) + dateString:dateString + (1900 + h.getYear()));
                                    if (h.getTime() > date.getTime()) date = DateTimeFormat.getFormat((inverso)?"yyyyMMdd":"ddMMyyyy").parse((inverso)?"" + (1900 + h.getYear() + 1) + dateString:dateString + (1900 + h.getYear() + 1));
                                } else if (dateString.length() == 6) { // dia, mes y año del año 20xx
                                    date = DateTimeFormat.getFormat((inverso)?"yyyyMMdd":"ddMMyyyy").parse((inverso)?"20" + dateString:dateString.substring(0, 4) + "20" + dateString.substring(4));
                                } else if (dateString.length() == 8) { // dia mes y año sin separadores
                                    date = DateTimeFormat.getFormat((inverso)?"yyyyMMdd":"ddMMyyyy").parse((inverso)?dateString:dateString);
                                } else if (lenient) {
                                    date = format.parse(aux);
                                } else {
                                    date = format.parseStrict(aux);
                                }
                                 */
                    }
                }

            }


            // Some version of Firefox sets the timestamp to 0 if parsing fails.
            if (date != null) r = Result.ok(date.atStartOfDay());

        }
        return r;
    }

}
