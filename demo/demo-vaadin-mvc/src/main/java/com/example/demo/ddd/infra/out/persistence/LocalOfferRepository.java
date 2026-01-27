package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Offer;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.OfferRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Tariff;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.TariffRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalOfferRepository extends LocalRepository<Offer, String> implements OfferRepository {
}
