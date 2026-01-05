package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCode;
import com.example.demo.ddd.infra.out.persistence.hotel.codes.BoardTypeCodeRepository;
import io.mateu.uidl.interfaces.Repository;
import io.mateu.core.infra.declarative.GenericCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BoardTypeCodes extends GenericCrud<BoardTypeCode> {

    final BoardTypeCodeRepository boardTypeCodeRepository;


    @Override
    public Repository<BoardTypeCode, String> repository() {
        return boardTypeCodeRepository;
    }
}
