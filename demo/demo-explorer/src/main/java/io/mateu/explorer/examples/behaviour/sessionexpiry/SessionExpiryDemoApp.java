package io.mateu.explorer.examples.behaviour.sessionexpiry;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** A one-screen app whose requests a demo guard can answer with 401 ({@link DemoTokenGuard}). */
@UI("/apps/session-expiry")
@Title("Session expiry demo")
@App
public class SessionExpiryDemoApp {

  @Menu LongForm form;
}
