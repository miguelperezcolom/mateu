package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCode;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.RoomTypeCodeRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalRoomTypeCodeRepository extends LocalRepository<RoomTypeCode, String> implements RoomTypeCodeRepository {
}
