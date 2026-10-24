package io.mateu.mdd.redwoodshowcase.ui;

import io.mateu.mdd.redwoodshowcase.ui.booking.BookingWizard;
import io.mateu.mdd.redwoodshowcase.ui.calendar.HousekeepingCalendar;
import io.mateu.mdd.redwoodshowcase.ui.catalog.Catalog;
import io.mateu.mdd.redwoodshowcase.ui.collectiondetail.HotelDirectory;
import io.mateu.mdd.redwoodshowcase.ui.dashboard.SalesDashboard;
import io.mateu.mdd.redwoodshowcase.ui.drawercrud.ContactsDrawerCrud;
import io.mateu.mdd.redwoodshowcase.ui.emptystates.EmptyStatesDemo;
import io.mateu.mdd.redwoodshowcase.ui.foldout.BookingFoldout;
import io.mateu.mdd.redwoodshowcase.ui.foldout.BookingFoldoutHorizontal;
import io.mateu.mdd.redwoodshowcase.ui.forms.ContactAndMoneyFields;
import io.mateu.mdd.redwoodshowcase.ui.forms.GuestProfile;
import io.mateu.mdd.redwoodshowcase.ui.generaloverview.RequisitionOverview;
import io.mateu.mdd.redwoodshowcase.ui.herosearch.HotelSearch;
import io.mateu.mdd.redwoodshowcase.ui.itemoverview.ProductOverview;
import io.mateu.mdd.redwoodshowcase.ui.smartsearch.AssetSearch;
import io.mateu.mdd.redwoodshowcase.ui.todolist.FrontDeskTasks;
import io.mateu.mdd.redwoodshowcase.ui.welcome.WelcomeDemo;
import io.mateu.mdd.redwoodshowcase.ui.createedit.EmployeeEdit;
import io.mateu.mdd.redwoodshowcase.ui.createedit.OrderEdit;
import io.mateu.mdd.redwoodshowcase.ui.drawer.BottomDrawerDemo;
import io.mateu.mdd.redwoodshowcase.ui.drawer.GeneralDrawerDemo;
import io.mateu.mdd.redwoodshowcase.ui.datamanagement.DataManagementDemo;
import io.mateu.mdd.redwoodshowcase.ui.ganttpage.GanttPageDemo;
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
@App(value = AppVariant.HAMBURGER_MENU, themeToggle = true)
public class ShowcaseApp {

  @Menu WelcomeDemo welcome;

  @Menu SalesDashboard dashboard;

  @Menu HotelDirectory collectionDetail;

  @Menu RequisitionOverview generalOverview;

  @Menu ProductOverview itemOverview;

  @Menu BookingFoldout foldout;

  @Menu BookingFoldoutHorizontal foldoutHorizontal;

  @Menu HotelSearch heroSearch;

  @Menu AssetSearch smartSearch;

  @Menu FrontDeskTasks frontDeskTasks;

  @Menu HousekeepingCalendar housekeepingCalendar;

  @Menu EmptyStatesDemo emptyStates;

  @Menu io.mateu.mdd.redwoodshowcase.ui.activity.ActivityDemo activity;

  @Menu Catalog listCrud;

  @Menu ContactsDrawerCrud drawerCrud;

  // the Redwood drawer templates (general = side, bottom = docked) and the two data-heavy pages
  @Menu GeneralDrawerDemo generalDrawer;

  @Menu BottomDrawerDemo bottomDrawer;

  @Menu DataManagementDemo dataManagement;

  // Advanced create and edit: with the section index (@Toc) and with a detail slot (@Aside)
  @Menu EmployeeEdit advancedCreateEdit;

  @Menu OrderEdit advancedCreateEditAside;

  @Menu GanttPageDemo ganttPage;

  @Menu BookingWizard guidedProcess;

  @Menu GuestProfile zonesForm;

  @Menu ContactAndMoneyFields typedInputs;
}
