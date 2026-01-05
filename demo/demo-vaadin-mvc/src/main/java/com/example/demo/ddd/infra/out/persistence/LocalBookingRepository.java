package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.booking.Booking;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.BookingRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Hotel;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.HotelRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalBookingRepository extends CompositionLocalRepository<Booking, String, String> implements BookingRepository {
    @Override
    public boolean belongsToParent(Booking entity, String parentId) {
        return parentId.equals(entity.fileId());
    }
}
