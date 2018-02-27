package io.mateu.ui.mdd.server.interfaces;

import java.time.LocalDate;

public interface CalendarLimiter {

    LocalDate getBegining();

    LocalDate getEnding();

}
