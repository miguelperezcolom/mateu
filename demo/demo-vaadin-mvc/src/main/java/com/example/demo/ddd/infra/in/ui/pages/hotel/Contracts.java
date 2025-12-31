package com.example.demo.ddd.infra.in.ui.pages.hotel;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Contract;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.ContractRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.shared.Repository;
import com.example.demo.ddd.infra.in.ui.pages.shared.GenericCrud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Contracts extends GenericCrud<Contract> {

    final ContractRepository contractRepository;


    @Override
    public Repository<Contract, String> repository() {
        return contractRepository;
    }
}
