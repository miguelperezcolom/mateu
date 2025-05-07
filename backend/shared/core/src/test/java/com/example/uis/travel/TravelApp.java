package com.example.uis.travel;

import com.example.uis.travel.uidl.App;
import com.example.uis.travel.uidl.Home;
import com.example.uis.travel.uidl.Menu;
import io.mateu.uidl.annotations.MateuUI;

@MateuUI("/travel")
public class TravelApp implements App {

  @Menu
  CallCenterMenu callCenter;

  @Home HomePage home;

}
