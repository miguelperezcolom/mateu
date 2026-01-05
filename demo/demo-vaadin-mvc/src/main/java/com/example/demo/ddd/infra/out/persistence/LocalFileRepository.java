package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.booking.Booking;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.BookingRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.File;
import com.example.demo.ddd.infra.out.persistence.hotel.booking.FileRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalFileRepository extends LocalRepository<File, String> implements FileRepository {
}
