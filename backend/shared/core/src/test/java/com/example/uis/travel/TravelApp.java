package com.example.uis.travel;

import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.interfaces.App;

@MateuUI("/travel")
public class TravelApp implements App {

  @Menu CallCenterMenu callCenter;

  @HomeRoute("")
  HomePage home;
}
