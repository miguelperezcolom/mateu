package io.mateu.uidl.interfaces;

import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.data.Validation;

import java.util.List;

public interface ValidationDtoSupplier {

  List<ValidationDto> validationDtos();
}
