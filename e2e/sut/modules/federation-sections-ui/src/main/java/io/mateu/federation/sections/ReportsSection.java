package io.mateu.federation.sections;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Menu;

/** A local section: two entries, the second a group (the band's third level, as a dropdown). */
public class ReportsSection {

    @Menu
    @Label("Summary")
    SummaryPage summary;

    @Menu
    @Label("Archive")
    ArchiveMenu archive;

    /** The group: its entries open from a dropdown in the band. */
    public static class ArchiveMenu {

        @Menu
        @Label("Daily")
        DailyPage daily;

        @Menu
        @Label("Monthly")
        MonthlyPage monthly;
    }
}
