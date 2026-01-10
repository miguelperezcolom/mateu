package com.example.demo.ddd.infra.in.ui.product.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCode;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeRepository;
import io.mateu.uidl.interfaces.Repository;
import io.mateu.core.infra.declarative.GenericCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomTypeCodes extends GenericCrud<RoomTypeCode> {

    final RoomTypeCodeRepository roomTypeCodeRepository;


    @Override
    public Repository<RoomTypeCode, String> repository() {
        return roomTypeCodeRepository;
    }
}
