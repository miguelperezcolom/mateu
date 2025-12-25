package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.domain.hotel.agency.Agency;
import com.example.demo.ddd.domain.hotel.shared.Repository;
import com.example.demo.ddd.domain.hotel.world.CountryRepository;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class Countries extends GenericListingBackend<Agency> {

    final CountryRepository countryRepository;


    @Override
    public Repository<? extends GenericEntity, String> repository() {
        return countryRepository;
    }
}
