package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.domain.hotel.agency.Agency;
import com.example.demo.ddd.domain.hotel.shared.Repository;
import com.example.demo.ddd.domain.hotel.world.Country;
import com.example.demo.ddd.domain.hotel.world.CountryRepository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericListingBackend;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
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
