package io.mateu.core.application;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.UI;

/**
 * An app whose route (test {@code routes.yaml}) declares an app-scope {@code appData} source. Used
 * by {@link AppDataSourceSyncTest}. The {@code @Menu} field makes it an app (so a shell is built).
 */
@UI("/appdata-app")
public class AppDataApp {
  @Menu String home = "/appdata-app/home";
}
