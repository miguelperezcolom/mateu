package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record Amount(String currency, double value, String locale) {

  public Amount(String currency, double value) {
    this(currency, value, "de-DE");
  }
}
