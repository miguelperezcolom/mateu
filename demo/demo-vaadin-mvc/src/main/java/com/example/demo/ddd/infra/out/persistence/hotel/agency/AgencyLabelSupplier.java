package com.example.demo.ddd.infra.out.persistence.hotel.agency;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AgencyLabelSupplier implements LabelSupplier {

    final AgencyRepository agencyRepository;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return agencyRepository.findById((String) id)
                .map(Agency::name)
                .orElse("No agency with id " + id);
    }
}
