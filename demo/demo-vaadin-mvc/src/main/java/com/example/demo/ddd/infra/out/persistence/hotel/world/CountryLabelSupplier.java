package com.example.demo.ddd.infra.out.persistence.hotel.world;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CountryLabelSupplier implements LabelSupplier {

    final CountryRepository countryRepository;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return countryRepository.findById((String) id)
                .map(Country::name)
                .orElse("No country with code " + id);
    }
}
