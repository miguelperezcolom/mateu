package io.mateu.core.infra.declarative.crudorchestrator;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.getValidations;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper;
import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.interfaces.CrudCreationForm;
import io.mateu.uidl.interfaces.CrudEditorForm;
import io.mateu.uidl.interfaces.ValidationDtoSupplier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

public abstract class ValidationDtoSupplierLayer<
        View,
        Editor extends CrudEditorForm<IdType>,
        CreationForm extends CrudCreationForm<IdType>,
        Filters,
        Row,
        IdType>
    extends RouteHandlerLayer<View, Editor, CreationForm, Filters, Row, IdType>
    implements ValidationDtoSupplier {

  @Override
  public List<ValidationDto> validationDtos() {
    if ("edit".equals(_state) || "create".equals(_state)) {
      List<ValidationDto> fieldLevelValidations = new ArrayList<>();
      getAllFields(entityClass()).stream()
          .flatMap(field -> getValidations(field).stream())
          .filter(Objects::nonNull)
          .forEach(fieldLevelValidations::add);
      return Stream.concat(
              fieldLevelValidations.stream(),
              Arrays.stream(
                      viewClass().getAnnotationsByType(io.mateu.uidl.annotations.Validation.class))
                  .map(ComponentTreeSupplierToDtoMapper::mapToValidation))
          .toList();
    }
    return List.of();
  }
}
