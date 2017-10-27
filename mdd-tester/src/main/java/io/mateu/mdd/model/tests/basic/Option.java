package io.mateu.mdd.model.tests.basic;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class Option {

    private String city;

    private String hotelName;

    private String category;

    private String rooms;

    private String board;

    private double price;

    private String currency;

    private String key;

    public Option(String city, String hotelName, String category, String rooms, String board, double price, String currency, String key) {
        this.city = city;
        this.hotelName = hotelName;
        this.category = category;
        this.rooms = rooms;
        this.board = board;
        this.price = price;
        this.currency = currency;
        this.key = key;
    }

    public Option() {
    }
}
