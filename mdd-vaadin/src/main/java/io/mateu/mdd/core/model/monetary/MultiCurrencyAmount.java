package io.mateu.mdd.core.model.monetary;

import lombok.Getter;
import lombok.Setter;
import io.mateu.mdd.core.MDD;
import org.javamoney.moneta.FastMoney;

import javax.persistence.Embeddable;
import java.time.LocalDate;

@Embeddable
@Getter@Setter
public class MultiCurrencyAmount {

    private FastMoney operationAmount;

    private FastMoney officeAmount;

    private FastMoney centralAmount;


    private LocalDate date;


    private double officeChange;

    private double centralChange;

    @Override
    public String toString() {
        FastMoney amount = operationAmount;
        if (MDD.isViewingOfficeCurrency()) amount = officeAmount;
        else if (MDD.isViewingCentralCurrency()) amount = centralAmount;
        return (amount != null)?amount.toString():"";
    }
}
