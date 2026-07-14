package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.PaymentMethodDto;
import io.mateu.dtos.PaymentPickerDto;
import io.mateu.uidl.data.PaymentPicker;
import java.util.List;

public class PaymentPickerMapper {

  public static ClientSideComponentDto mapPaymentPickerToDto(PaymentPicker paymentPicker) {
    return new ClientSideComponentDto(
        PaymentPickerDto.builder()
            .actionId(paymentPicker.actionId())
            .methods(
                paymentPicker.methods() != null
                    ? paymentPicker.methods().stream()
                        .map(method -> new PaymentMethodDto(method.id(), method.label()))
                        .toList()
                    : List.of())
            .selected(paymentPicker.selected())
            .contextLabel(paymentPicker.contextLabel())
            .contextValue(paymentPicker.contextValue())
            .confirmLabel(paymentPicker.confirmLabel())
            .build(),
        paymentPicker.id(),
        List.of(),
        paymentPicker.style(),
        paymentPicker.cssClasses(),
        null);
  }
}
