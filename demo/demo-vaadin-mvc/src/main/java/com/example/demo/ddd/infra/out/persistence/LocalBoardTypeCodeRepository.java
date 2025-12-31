package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCode;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCodeRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalBoardTypeCodeRepository extends LocalRepository<BoardTypeCode, String> implements BoardTypeCodeRepository {
}
