package com.example.demo.ddd.infra.out.persistence.hotel.codes;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomTypeCodeLabelSupplier implements LabelSupplier {

    final RoomTypeCodeRepository roomTypeCodeRepository;

    @Override
    public String label(Object id, HttpRequest httpRequest) {
        return roomTypeCodeRepository.findById((String) id)
                .map(RoomTypeCode::name)
                .orElse("No room type code with id " + id);
    }
}
