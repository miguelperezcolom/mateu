package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff;

import io.mateu.uidl.annotations.Label;

public enum UseType {
    @Label("Base Child")
    NB,
    @Label("Additional Child")
    NA,
    @Label("Base Adult")
    AB,
    @Label("Additional Adult")
    AD,
}
