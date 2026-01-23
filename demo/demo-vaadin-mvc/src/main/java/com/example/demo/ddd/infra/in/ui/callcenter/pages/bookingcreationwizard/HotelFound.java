package com.example.demo.ddd.infra.in.ui.callcenter.pages.bookingcreationwizard;

public record HotelFound(
        String name,
        String image,
        double total,
        String offers,
        String comments,
        boolean onRequest
) {
}
