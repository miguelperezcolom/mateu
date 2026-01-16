package com.example.demo.ddd.infra.in.ui.financial.pages;

import com.example.demo.ddd.infra.out.persistence.hotel.financial.Account;
import com.example.demo.ddd.infra.out.persistence.hotel.financial.AccountRepository;
import io.mateu.core.infra.declarative.GenericCrud;
import io.mateu.uidl.interfaces.Repository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Accounts extends GenericCrud<Account> {

    final AccountRepository accountRepository;

    @Override
    public Repository<Account, String> repository() {
        return accountRepository;
    }

}
