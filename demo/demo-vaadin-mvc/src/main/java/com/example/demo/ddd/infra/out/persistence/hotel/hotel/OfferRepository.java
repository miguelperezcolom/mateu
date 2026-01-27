package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import io.mateu.uidl.interfaces.Repository;

public interface OfferRepository extends Repository<Offer, String> {
    void reset();
}
