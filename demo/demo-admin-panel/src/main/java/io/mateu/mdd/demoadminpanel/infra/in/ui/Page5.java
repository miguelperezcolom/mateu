package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.data.Message;

public class Page5 {


    @Searchable(selector = HotelSelector.class, label = HotelSelector.class)
    String hotelId;


    @Button
    Object save() {
        return Message.success("Saved");
    }

}
