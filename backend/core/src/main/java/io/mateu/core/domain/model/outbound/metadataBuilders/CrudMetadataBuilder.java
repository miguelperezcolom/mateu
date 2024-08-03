package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.outbound.metadataBuilders.fields.FieldTypeMapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.DynamicCrud;
import io.mateu.core.domain.uidefinition.core.interfaces.HasSubtitle;
import io.mateu.core.domain.uidefinition.core.interfaces.RpcCrudViewExtended;
import io.mateu.core.domain.uidefinition.shared.annotations.Ignored;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.Column;
import io.mateu.dtos.Crud;
import io.mateu.dtos.SearchForm;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CrudMetadataBuilder {

  final ActionMetadataBuilder actionMetadataBuilder;
  final FieldMetadataBuilder fieldMetadataBuilder;
  final FieldTypeMapper fieldTypeMapper;
  final ReflectionHelper reflectionHelper;
  final CaptionProvider captionProvider;

  @SneakyThrows
  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Crud build(String stepId, String listId, Object crudInstance) {

    if (crudInstance instanceof DynamicCrud) {
      return ((DynamicCrud) crudInstance).build().toFuture().get();
    }

    var rpcView = (Listing) crudInstance;

    return Crud.builder()
        .title(captionProvider.getCaption(rpcView))
        .subtitle(getSubtitle(rpcView))
        .canEdit(reflectionHelper.isOverridden(rpcView, "getDetail"))
        .searchForm(buildSearchForm(rpcView, listId))
        .columns(buildColumns(rpcView))
        .actions(actionMetadataBuilder.getActions(stepId, listId, rpcView))
        .listId(listId)
        .build();
  }

  private String getSubtitle(Listing rpcView) {
    if (rpcView instanceof HasSubtitle) {
      return ((HasSubtitle) rpcView).getSubtitle();
    }
    return null;
  }

  private List<Column> buildColumns(Listing rpcView) {
    Class rowClass = rpcView.getRowClass();
    Map<Field, String> columnIdsPerField = new HashMap<>();
    Map<Field, String> columnCaptionsPerField = new HashMap<>();
    List<Field> allRowFields = null;
    if (rpcView instanceof RpcCrudViewExtended) {
      allRowFields = ((RpcCrudViewExtended) rpcView).getColumnFieldNames();
      columnIdsPerField.putAll(((RpcCrudViewExtended) rpcView).getColumnIdsPerField());
      columnCaptionsPerField.putAll(((RpcCrudViewExtended) rpcView).getColumnCaptionsPerField());
    } else {
      allRowFields = reflectionHelper.getAllFields(rowClass);
    }
    return allRowFields.stream()
        .filter(f -> f != null)
        .filter(fieldInterfaced -> !fieldInterfaced.isAnnotationPresent(Ignored.class))
        .map(
            fieldInterfaced ->
                getColumn(
                    columnIdsPerField.getOrDefault(fieldInterfaced, fieldInterfaced.getId()),
                    columnCaptionsPerField.getOrDefault(
                        fieldInterfaced, captionProvider.getCaption(fieldInterfaced)),
                    fieldInterfaced))
        .collect(Collectors.toList());
  }

  private Column getColumn(String columnId, String columnCaption, Field field) {
    return Column.builder()
        .id(columnId)
        .caption(columnCaption)
        .type(fieldTypeMapper.mapColumnType(field))
        .stereotype("column")
        .attributes(List.of())
        .width(fieldTypeMapper.getWidth(field))
        .build();
  }

  private SearchForm buildSearchForm(Listing rpcView, String listId) {
    return SearchForm.builder().fields(buildSearchFields(rpcView, listId)).build();
  }

  private List<io.mateu.dtos.Field> buildSearchFields(Listing rpcView, String listId) {
    Class searchFormClass = rpcView.getSearchFormClass();
    List<Field> allEditableFields = reflectionHelper.getAllEditableFields(searchFormClass);
    if (rpcView instanceof RpcCrudViewExtended) {
      List<String> validFieldIds =
          ((RpcCrudViewExtended) rpcView)
              .getFilterFields().stream().map(f -> f.getId()).collect(Collectors.toList());
      if (validFieldIds.size() > 0) {
        List<Field> finalAllEditableFields = allEditableFields;
        allEditableFields =
            validFieldIds.stream()
                .map(
                    id ->
                        finalAllEditableFields.stream()
                            .filter(f -> id.equals(f.getId()))
                            .findFirst())
                .filter(f -> f.isPresent())
                .map(f -> f.get())
                .collect(Collectors.toList());
      }
    }

    List<io.mateu.dtos.Field> filterFields =
        allEditableFields.stream()
            .map(fieldInterfaced -> fieldMetadataBuilder.getField(rpcView, fieldInterfaced))
            .map(
                f -> {
                  f.setId(listId + "-" + f.getId());
                  return f;
                })
            .collect(Collectors.toList());

    if ("JpaRpcCrudView".equals(rpcView.getClass().getSimpleName()))
      filterFields.add(
          0,
          io.mateu.dtos.Field.builder()
              .id(listId + "-" + "_search-text")
              .placeholder("Search")
              .caption("Search")
              .type("string")
              .stereotype("input")
              .build());

    return filterFields;
  }
}
