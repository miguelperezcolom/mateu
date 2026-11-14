package io.mateu.demo.signin;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * The app shell: its header carries the built-in Sign out button (Mateu draws it there whenever the
 * page declares sign-in providers and a session is held).
 */
@UI("")
@Title("Sign-in demo")
public class Shell {

  @Menu Home home;

  @Menu WhoAmI whoAmI;
}
