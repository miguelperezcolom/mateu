package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import io.mateu.uidl.interfaces.Repository;

public interface HotelRepository extends Repository<Hotel, String> {
    void reset();
}
