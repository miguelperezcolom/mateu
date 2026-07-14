package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.AddOnDto;
import io.mateu.dtos.AddOnPickerDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.AddOnPicker;
import java.util.List;

public class AddOnPickerMapper {

  public static ClientSideComponentDto mapAddOnPickerToDto(AddOnPicker addOnPicker) {
    return new ClientSideComponentDto(
        AddOnPickerDto.builder()
            .totalLabel(addOnPicker.totalLabel())
            .currency(addOnPicker.currency())
            .actionId(addOnPicker.actionId())
            .items(
                addOnPicker.items() != null
                    ? addOnPicker.items().stream()
                        .map(
                            item ->
                                AddOnDto.builder()
                                    .id(item.id())
                                    .icon(item.icon())
                                    .title(item.title())
                                    .description(item.description())
                                    .price(item.price())
                                    .unit(item.unit())
                                    .includedLabel(item.includedLabel())
                                    .added(item.added())
                                    .build())
                        .toList()
                    : List.of())
            .build(),
        addOnPicker.id(),
        List.of(),
        addOnPicker.style(),
        addOnPicker.cssClasses(),
        null);
  }
}
