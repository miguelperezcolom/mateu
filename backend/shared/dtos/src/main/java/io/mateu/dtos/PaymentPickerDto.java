package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record PaymentPickerDto(
    String actionId,
    String methodActionId,
    List<PaymentMethodDto> methods,
    String selected,
    String contextLabel,
    String contextValue,
    String confirmLabel)
    implements ComponentMetadataDto {

  public PaymentPickerDto {
    methods = Collections.unmodifiableList(methods != null ? methods : Collections.emptyList());
  }

  @Override
  public List<PaymentMethodDto> methods() {
    return Collections.unmodifiableList(methods);
  }
}
