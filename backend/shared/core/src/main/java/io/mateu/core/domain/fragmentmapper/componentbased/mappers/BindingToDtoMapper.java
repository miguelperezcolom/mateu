package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.BindingDto;
import io.mateu.dtos.BindingSourceDto;
import io.mateu.uidl.data.Binding;

public class BindingToDtoMapper {

  public static BindingDto mapBindingToDto(Binding binding) {
    return new BindingDto(BindingSourceDto.valueOf(binding.source().name()), binding.propertyId());
  }
}
