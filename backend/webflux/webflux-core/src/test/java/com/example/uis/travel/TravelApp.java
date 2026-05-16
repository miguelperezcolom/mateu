package com.example.uis.travel;

import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.App;

@UI("/travel")
@Title("Travel app")
public class TravelApp implements App {

  @Menu CallCenterMenu callCenter;

  @HomeRoute("")
  HomePage home;
}
