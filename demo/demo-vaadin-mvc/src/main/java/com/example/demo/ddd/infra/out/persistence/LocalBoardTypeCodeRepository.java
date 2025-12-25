package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.domain.hotel.codes.BoardTypeCode;
import com.example.demo.ddd.domain.hotel.codes.BoardTypeCodeRepository;
import com.example.demo.ddd.domain.hotel.codes.RoomTypeCode;
import com.example.demo.ddd.domain.hotel.codes.RoomTypeCodeRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalBoardTypeCodeRepository extends LocalRepository<BoardTypeCode, String> implements BoardTypeCodeRepository {
}
