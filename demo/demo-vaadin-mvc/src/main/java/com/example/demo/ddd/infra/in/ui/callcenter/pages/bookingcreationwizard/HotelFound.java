package com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.Details;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Image;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ColumnAction;

public record HotelFound(
        @Hidden
        String id,
        String name,
        @Image
        String image,
        double total,
        @Hidden
        String offers,
        @Hidden
        String comments,
        @Hidden
        boolean onRequest,
        ColumnAction button
) {
}
