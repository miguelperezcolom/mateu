package io.mateu.mdd.tester.model.useCases.bankAccount;

import lombok.MateuMDDEntity;

@MateuMDDEntity
public class Banco extends BankAccount {

    public Banco(Bank bank) {
        super(bank);
    }

}
