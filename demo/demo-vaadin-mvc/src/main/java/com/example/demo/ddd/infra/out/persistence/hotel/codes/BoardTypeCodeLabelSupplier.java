package com.example.demo.ddd.infra.out.persistence.hotel.codes;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BoardTypeCodeLabelSupplier implements LabelSupplier {

    final BoardTypeCodeRepository boardTypeCodeRepository;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return boardTypeCodeRepository.findById((String) id)
                .map(BoardTypeCode::name)
                .orElse("No board type code with id " + id);
    }
}
