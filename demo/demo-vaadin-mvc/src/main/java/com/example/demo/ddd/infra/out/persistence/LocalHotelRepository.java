package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.domain.hotel.hotel.Hotel;
import com.example.demo.ddd.domain.hotel.hotel.HotelRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalHotelRepository extends LocalRepository<Hotel, String> implements HotelRepository {
}
