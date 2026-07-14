package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.LedgerDto;
import io.mateu.dtos.LedgerLineDto;
import io.mateu.uidl.data.Ledger;
import java.util.List;

public class LedgerMapper {

  public static ClientSideComponentDto mapLedgerToDto(Ledger ledger) {
    return new ClientSideComponentDto(
        LedgerDto.builder()
            .currency(ledger.currency())
            .totalLabel(ledger.totalLabel())
            .lines(
                ledger.lines() != null
                    ? ledger.lines().stream()
                        .map(
                            line ->
                                LedgerLineDto.builder()
                                    .concept(line.concept())
                                    .amount(line.amount())
                                    .included(line.included())
                                    .includedLabel(line.includedLabel())
                                    .build())
                        .toList()
                    : List.of())
            .total(ledger.total())
            .build(),
        ledger.id(),
        List.of(),
        ledger.style(),
        ledger.cssClasses(),
        null);
  }
}
