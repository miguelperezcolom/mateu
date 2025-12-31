package com.example.demo.ddd.infra.out.persistence.hotel.codes;

import io.mateu.uidl.annotations.Label;

public enum BoardType {
    @Label("Room Only")
    RO,
    @Label("Bed and Breakfast")
    BB,
    @Label("Half Board")
    HB,
    @Label("Full Board")
    FB,
    @Label("All Inclusive")
    AI
}
