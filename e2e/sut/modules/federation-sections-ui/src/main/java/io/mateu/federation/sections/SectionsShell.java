package io.mateu.federation.sections;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.fluent.AppVariant;

/**
 * The federation of fed-shell-app, drawn Opera Cloud style ({@code HAMBURGER_SECTIONS}): the
 * hamburger holds the sections — the menu's first level — and the band under the header the
 * entries of the section on screen (tests/federation-sections/hamburger-sections.spec.ts).
 *
 * <ul>
 *   <li><b>Remote</b>: the healthy remote (:8085). It answers with two entries, Page and Things,
 *       which become the entries of ONE section named as the shell names it.
 *   <li><b>Reports</b>: a local section with a second level and a group in it (the third level, a
 *       dropdown in the band).
 *   <li><b>Offline</b>: a remote nothing listens on (:8099). Its section is shown unavailable; the
 *       others are not affected.
 * </ul>
 */
@UI("")
@Title("Sections Shell")
@App(AppVariant.HAMBURGER_SECTIONS)
public class SectionsShell {

    @Menu
    RemoteMenu remote =
            new RemoteMenu("http://localhost:8085/remote").withLabel("Remote").withPath("/remote");

    @Menu
    @Label("Reports")
    ReportsSection reports;

    @Menu
    RemoteMenu offline =
            new RemoteMenu("http://localhost:8099/offline").withLabel("Offline").withPath("/offline");

}
