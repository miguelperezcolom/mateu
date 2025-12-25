package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.domain.hotel.codes.BoardTypeCode;
import com.example.demo.ddd.domain.hotel.codes.BoardTypeCodeRepository;
import com.example.demo.ddd.domain.hotel.shared.Repository;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class BoardTypeCodes extends GenericListingBackend<BoardTypeCode> {

    final BoardTypeCodeRepository boardTypeCodeRepository;


    @Override
    public Repository<? extends GenericEntity, String> repository() {
        return boardTypeCodeRepository;
    }
}
