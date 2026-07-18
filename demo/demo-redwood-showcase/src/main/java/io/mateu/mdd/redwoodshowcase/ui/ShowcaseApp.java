package io.mateu.mdd.redwoodshowcase.ui;

import io.mateu.mdd.redwoodshowcase.ui.booking.BookingWizard;
import io.mateu.mdd.redwoodshowcase.ui.catalog.Catalog;
import io.mateu.mdd.redwoodshowcase.ui.collectiondetail.HotelDirectory;
import io.mateu.mdd.redwoodshowcase.ui.dashboard.SalesDashboard;
import io.mateu.mdd.redwoodshowcase.ui.drawercrud.ContactsDrawerCrud;
import io.mateu.mdd.redwoodshowcase.ui.emptystates.EmptyStatesDemo;
import io.mateu.mdd.redwoodshowcase.ui.foldout.BookingFoldout;
import io.mateu.mdd.redwoodshowcase.ui.foldout.BookingFoldoutHorizontal;
import io.mateu.mdd.redwoodshowcase.ui.forms.GuestProfile;
import io.mateu.mdd.redwoodshowcase.ui.generaloverview.RequisitionOverview;
import io.mateu.mdd.redwoodshowcase.ui.herosearch.HotelSearch;
import io.mateu.mdd.redwoodshowcase.ui.itemoverview.ProductOverview;
import io.mateu.mdd.redwoodshowcase.ui.welcome.WelcomeDemo;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/**
 * Root app for the Redwood showcase — a menu over one screen per Oracle Redwood page template, in a
 * fixed order, so each template can be reviewed against its RDS reference for pixel fidelity.
 */
@UI("")
@Title("Redwood Showcase")
@App(value = AppVariant.HAMBURGUER_MENU, themeToggle = true)
public class ShowcaseApp {

  @Menu WelcomeDemo welcome;

  @Menu SalesDashboard dashboard;

  @Menu HotelDirectory collectionDetail;

  @Menu RequisitionOverview generalOverview;

  @Menu ProductOverview itemOverview;

  @Menu BookingFoldout foldout;

  @Menu BookingFoldoutHorizontal foldoutHorizontal;

  @Menu HotelSearch heroSearch;

  @Menu EmptyStatesDemo emptyStates;

  @Menu Catalog listCrud;

  @Menu ContactsDrawerCrud drawerCrud;

  @Menu BookingWizard guidedProcess;

  @Menu GuestProfile zonesForm;
}
