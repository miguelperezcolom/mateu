package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;
import org.javamoney.moneta.FastMoney;
import org.javamoney.moneta.Money;

import javax.money.MonetaryAmount;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter@Setter
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
