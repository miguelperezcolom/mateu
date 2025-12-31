package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.hotel.Contract;
import com.example.demo.ddd.infra.out.persistence.hotel.hotel.ContractRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalContractRepository extends LocalRepository<Contract, String> implements ContractRepository {
}
