package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.layouts.*;
import com.example.demo.infra.ui.menus.layouts.booking.BookingView;
import com.example.demo.infra.ui.menus.layouts.booking.BookingsCrud;
import io.mateu.uidl.annotations.MenuOption;

public class LayoutsSubmenu {

  @MenuOption
  HorizontalLayoutForm horizontalLayout;

  @MenuOption
  VerticalLayoutForm verticalLayout;

  @MenuOption
  SplitLayoutForm splitLayout;

  @MenuOption
  TabLayoutForm tabLayout;

  @MenuOption
  CompleteView completeView;

  @MenuOption
  ViewWithRemoteContent viewWithRemoteContent;

  @MenuOption
  BookingsCrud bookings;

  @MenuOption
  BookingView bookingView;
}
