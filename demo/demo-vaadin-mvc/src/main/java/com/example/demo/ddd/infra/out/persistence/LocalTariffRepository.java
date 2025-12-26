package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.domain.hotel.hotel.Tariff;
import com.example.demo.ddd.domain.hotel.hotel.TariffRepository;
import com.example.demo.ddd.domain.hotel.world.Country;
import com.example.demo.ddd.domain.hotel.world.CountryRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalTariffRepository extends LocalRepository<Tariff, String> implements TariffRepository {
}
