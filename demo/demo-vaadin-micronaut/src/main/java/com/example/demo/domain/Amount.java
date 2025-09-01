package com.example.demo.domain;

import io.micronaut.serde.annotation.Serdeable;

import java.text.NumberFormat;
import java.util.Currency;
import java.util.Locale;

@Serdeable
public record Amount(double value, String currencyCode) {

    @Override
    public String toString() {
        Currency currentCurrency = Currency.getInstance(currencyCode);
        NumberFormat currencyFormatter =
                NumberFormat.getCurrencyInstance();
        currencyFormatter.setCurrency(currentCurrency);
        return currencyFormatter.format(value);
    }
}
