package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.world.Country;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalCountryRepository extends LocalRepository<Country, String> implements CountryRepository {
}
