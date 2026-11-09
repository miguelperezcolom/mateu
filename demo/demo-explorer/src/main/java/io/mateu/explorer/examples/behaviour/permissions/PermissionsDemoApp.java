package io.mateu.explorer.examples.behaviour.permissions;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * A tiny app whose header carries the demo role switcher: an {@code @AppContext} enum. The browser
 * keeps the value picked and sends it with every request of this origin; {@link DemoRoleResolver}
 * turns it into the caller's roles (a demo device — see there).
 */
@UI("/apps/permissions")
@Title("Permissions demo")
@App
public class PermissionsDemoApp {

  @AppContext(label = "Role (demo)")
  DemoRole demoRole;

  @Menu PayrollRecord payroll;
}
