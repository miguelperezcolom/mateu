package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Tariff;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.TariffRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalTariffRepository extends LocalRepository<Tariff, String> implements TariffRepository {
}
