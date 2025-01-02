package com.example.demo.demobooking;

import io.mateu.uidl.annotations.AppTitle;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.annotations.RawContent;

@MateuUI("/demobooking")
@AppTitle("My app")
public class Home {

    @MenuOption
    IncompleteBookingsCrud bookingsIncomplete;

    @MenuOption
    BookingsCrud bookings;

    @MenuOption(remote = true)
    String financial = "https://article2.mateu.io/financial#financial";

    @RawContent
    String message = "Hola aa!!";

}
