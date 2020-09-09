package io.mateu.mdd.tester.model.useCases.bankAccount;

import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.persistence.JPATransaction;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.EntityManager;

@Slf4j
public class Tester {

    public static void main(String[] args) throws Throwable {

        test1();

    }

    private static void test1() throws Throwable {

        Helper.transact(new JPATransaction() {
            @Override
            public void run(EntityManager em) throws Throwable {

                //BankAccount account = em.find(BankAccount.class, 1);

                Payment p = em.find(Payment.class, 1l);


                log.debug("" + p.getAccount().getBalance());

                p.setAmount(100 + p.getAmount());

                log.debug("" + p.getAccount().getBalance());

                em.merge(p);
                em.merge(p.getAccount());

            }
        });

    }
}
