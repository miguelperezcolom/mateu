package io.mateu.ui.mdd.server.interfaces;

import io.mateu.ui.core.client.views.AbstractForm;
import io.mateu.ui.core.shared.UserData;

import java.time.LocalDate;
import java.util.List;

public interface UseCalendarToEdit extends FormOwner {

    List<LocalDate> getCalendarDates();

    public String getCalendarText();

    public String getCalendarCss();

    String getNamePropertyName();

    String getDatesRangesPropertyName();
}
