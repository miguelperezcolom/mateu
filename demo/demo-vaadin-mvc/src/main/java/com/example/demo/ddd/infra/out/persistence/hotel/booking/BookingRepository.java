package com.example.demo.ddd.infra.out.persistence.hotel.booking;

import io.mateu.uidl.interfaces.CompositionRepository;
import io.mateu.uidl.interfaces.Repository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Country;

public interface BookingRepository extends CompositionRepository<Booking, String, String> {
}
