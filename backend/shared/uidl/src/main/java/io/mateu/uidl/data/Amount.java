package io.mateu.uidl.data;

import java.text.NumberFormat;
import java.util.Currency;
import lombok.Builder;

@Builder
public record Amount(String currency, double value, String locale) {

  public Amount(String currency, double value) {
    this(currency, value, "de-DE");
  }

  @Override
  public String toString() {
    Currency currentCurrency = Currency.getInstance(currency);
    NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance();
    currencyFormatter.setCurrency(currentCurrency);
    return currencyFormatter.format(value);
  }
}
