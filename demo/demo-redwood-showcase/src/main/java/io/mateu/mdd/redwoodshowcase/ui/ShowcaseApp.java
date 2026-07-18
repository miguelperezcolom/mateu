package io.mateu.mdd.redwoodshowcase.ui;

import io.mateu.mdd.redwoodshowcase.ui.booking.BookingWizard;
import io.mateu.mdd.redwoodshowcase.ui.catalog.Catalog;
import io.mateu.mdd.redwoodshowcase.ui.dashboard.OverviewDashboard;
import io.mateu.mdd.redwoodshowcase.ui.forms.GuestProfile;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * Root app for the Redwood showcase. Aggregates the demo screens under one Oracle Redwood shell so
 * the renderer's chrome, navigation and each UX pattern can be reviewed in one place.
 */
@UI("")
@Title("Redwood Showcase")
@App(value = AppVariant.HAMBURGUER_MENU, themeToggle = true)
public class ShowcaseApp {

    @Menu
    OverviewDashboard dashboard;

    @Menu
    Catalog catalog;

    @Menu
    GuestProfile guest;

    @Menu
    BookingWizard booking;
}
