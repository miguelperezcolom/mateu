package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.domain.hotel.hotel.Contract;
import com.example.demo.ddd.domain.hotel.hotel.ContractRepository;
import com.example.demo.ddd.domain.hotel.hotel.Tariff;
import com.example.demo.ddd.domain.hotel.hotel.TariffRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalContractRepository extends LocalRepository<Contract, String> implements ContractRepository {
}
