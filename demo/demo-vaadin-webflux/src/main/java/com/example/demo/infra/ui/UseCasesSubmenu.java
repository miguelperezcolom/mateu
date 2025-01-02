package com.example.demo.infra.ui;

import com.example.demo.demobooking.BookingsCrud;
import com.example.demo.demobooking.IncompleteBookingsCrud;
import io.mateu.uidl.annotations.MenuOption;
import io.mateu.uidl.annotations.Submenu;

class BookingSubmenu {

    @MenuOption
    IncompleteBookingsCrud bookingsIncomplete;

    @MenuOption
    BookingsCrud bookings;

    @MenuOption(remote = true)
    String financial = "https://article2.mateu.io/financial#financial";

}


public class UseCasesSubmenu {

    @Submenu
    BookingSubmenu booking;

}
