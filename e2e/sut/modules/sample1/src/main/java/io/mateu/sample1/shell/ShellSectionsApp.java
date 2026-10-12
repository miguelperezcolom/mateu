package io.mateu.sample1.shell;

import io.mateu.sample1.Section1;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/** An explicit HAMBURGER_SECTIONS shell: sections in the hamburger, entries in the band. */
@UI("/shell-sections")
@Title("Shell sections")
@App(AppVariant.HAMBURGER_SECTIONS)
public class ShellSectionsApp {

  @Menu Section1 page;

  @Menu ShellReports reports;
}
