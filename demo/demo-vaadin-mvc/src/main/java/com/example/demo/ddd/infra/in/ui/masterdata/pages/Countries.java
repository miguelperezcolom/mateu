package com.example.demo.ddd.infra.in.ui.masterdata.pages;

import io.mateu.uidl.interfaces.Repository;
import com.example.demo.ddd.infra.out.persistence.hotel.world.Country;
import com.example.demo.ddd.infra.out.persistence.hotel.world.CountryRepository;
import io.mateu.core.infra.declarative.GenericCrud;
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
