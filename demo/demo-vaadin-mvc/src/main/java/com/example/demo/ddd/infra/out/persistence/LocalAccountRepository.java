package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.infra.out.persistence.hotel.financial.Account;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.AccountRepository;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.Payment;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.PaymentRepository;
import org.springframework.stereotype.Service;

@Service
public class LocalAccountRepository extends LocalRepository<Account, String> implements AccountRepository {
}
