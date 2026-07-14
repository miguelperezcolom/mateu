package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record LedgerDto(String currency, String totalLabel, List<LedgerLineDto> lines, Double total)
    implements ComponentMetadataDto {

  public LedgerDto {
    lines = Collections.unmodifiableList(lines != null ? lines : Collections.emptyList());
  }

  @Override
  public List<LedgerLineDto> lines() {
    return Collections.unmodifiableList(lines);
  }
}
