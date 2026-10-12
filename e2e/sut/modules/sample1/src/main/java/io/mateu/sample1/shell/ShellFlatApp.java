package io.mateu.sample1.shell;

import io.mateu.sample1.Section1;
import io.mateu.sample1.Section2;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** AUTO with no groups at all: drawn as TABS. */
@UI("/shell-flat")
@Title("Shell flat")
public class ShellFlatApp {

  @Menu Section1 page;

  @Menu Section2 monthly;
}
