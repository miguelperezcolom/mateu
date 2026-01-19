package com.example.demo.ddd.infra.in.ui.product.pages.hotel.bookingcreationwizard;

public record HotelFound(
        String name,
        String image,
        double total,
        String offers,
        String comments,
        boolean onRequest
) {
}
