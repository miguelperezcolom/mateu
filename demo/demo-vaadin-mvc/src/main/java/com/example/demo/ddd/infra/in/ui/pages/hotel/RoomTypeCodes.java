package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCode;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.shared.Repository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
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
