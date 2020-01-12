package io.mateu.mdd.core.interfaces;

import java.time.LocalDate;
import java.util.List;

public interface UseCalendarToEdit {

    List<LocalDate> getCalendarDates();

    public String getCalendarText();

    public String getCalendarCss();

    String getNamePropertyName();

    String getDatesRangesPropertyName();
}
