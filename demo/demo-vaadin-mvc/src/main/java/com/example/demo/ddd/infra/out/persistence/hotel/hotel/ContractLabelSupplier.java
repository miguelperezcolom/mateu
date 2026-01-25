package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.Season;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContractLabelSupplier implements LabelSupplier {

    final ContractRepository contractRepository;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return contractRepository.findById((String) id)
                .map(Contract::name)
                .orElse("No contract with id " + id);
    }
}
