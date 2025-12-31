package com.example.demo.ddd.infra.out.persistence.hotel.hotel.tariff.applicationterms;

import io.mateu.uidl.annotations.Label;

public enum TermType {
    @Label("Minimum Stay")
    EM,
    @Label("Anticipation")
    ANT,
    @Label("Early Booking")
    EB,
    @Label("Non Refundable")
    NR,
    @Label("Minimum Occupation")
    OM
}
