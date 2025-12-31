package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.shared.Repository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Country;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryRepository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Countries extends GenericCrud<Country> {

    final CountryRepository countryRepository;


    @Override
    public Repository<Country, String> repository() {
        return countryRepository;
    }
}
