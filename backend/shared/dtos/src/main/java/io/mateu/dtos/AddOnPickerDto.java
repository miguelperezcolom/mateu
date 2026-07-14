package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record AddOnPickerDto(
    String totalLabel, String currency, String actionId, List<AddOnDto> items)
    implements ComponentMetadataDto {

  public AddOnPickerDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<AddOnDto> items() {
    return Collections.unmodifiableList(items);
  }
}
