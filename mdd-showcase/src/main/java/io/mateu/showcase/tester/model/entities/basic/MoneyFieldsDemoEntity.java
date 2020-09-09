package io.mateu.showcase.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.SearchFilter;
import org.javamoney.moneta.FastMoney;
import org.javamoney.moneta.Money;

import javax.money.MonetaryAmount;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class MoneyFieldsDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String name;

    private MonetaryAmount monetaryAmountField;

    @NotNull
    private FastMoney fastMoneyField = FastMoney.of(10.3, "EUR");

    private Money moneyField;


}
