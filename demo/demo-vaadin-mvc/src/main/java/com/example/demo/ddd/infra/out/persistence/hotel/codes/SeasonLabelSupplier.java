package com.example.demo.ddd.infra.out.persistence.hotel.codes;

import com.example.demo.ddd.infra.out.persistence.hotel.agency.Agency;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SeasonLabelSupplier implements LabelSupplier {

    final SeasonRepository seasonRepository;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return seasonRepository.findById((String) id)
                .map(Season::name)
                .orElse("No season with id " + id);
    }
}
