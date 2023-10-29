package io.mateu.core.domain.model.metadataBuilders;

import io.mateu.core.domain.model.metadataBuilders.fields.FieldTypeMapper;
import io.mateu.mdd.core.interfaces.DynamicCrud;
import io.mateu.mdd.core.interfaces.HasSubtitle;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.core.interfaces.RpcCrudViewExtended;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.remote.dtos.Crud;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CrudMetadataBuilder {

  final ActionMetadataBuilder actionMetadataBuilder;
  final FieldMetadataBuilder fieldMetadataBuilder;
  final FieldTypeMapper fieldTypeMapper;
  final ReflectionHelper reflectionHelper;

  @SneakyThrows
  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Crud build(String stepId, String listId, Object crudInstance) {

    if (crudInstance instanceof DynamicCrud) {
      return ((DynamicCrud) crudInstance).build().toFuture().get();
    }

    var rpcView = (Listing) crudInstance;

    return Crud.builder()
        .title(getTitle(rpcView))
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

  private String getTitle(Listing rpcView) {
    if (rpcView instanceof HasTitle) {
      return ((HasTitle) rpcView).getTitle();
    }
    return rpcView.getCaption();
  }

  private List<Column> buildColumns(Listing rpcView) {
    Class rowClass = rpcView.getRowClass();
    Map<FieldInterfaced, String> columnIdsPerField = new HashMap<>();
    Map<FieldInterfaced, String> columnCaptionsPerField = new HashMap<>();
    List<FieldInterfaced> allRowFields = null;
    if (rpcView instanceof RpcCrudViewExtended) {
      allRowFields = ((RpcCrudViewExtended) rpcView).getColumnFieldNames();
      columnIdsPerField.putAll(((RpcCrudViewExtended) rpcView).getColumnIdsPerField());
      columnCaptionsPerField.putAll(((RpcCrudViewExtended) rpcView).getColumnCaptionsPerField());
    } else {
      allRowFields = reflectionHelper.getAllFields(rowClass);
    }
    return allRowFields.stream()
        .filter(fieldInterfaced -> !fieldInterfaced.isAnnotationPresent(Ignored.class))
        .map(
            fieldInterfaced ->
                getColumn(
                    columnIdsPerField.getOrDefault(fieldInterfaced, fieldInterfaced.getId()),
                    columnCaptionsPerField.getOrDefault(
                        fieldInterfaced, reflectionHelper.getCaption(fieldInterfaced)),
                    fieldInterfaced))
        .collect(Collectors.toList());
  }

  private Column getColumn(String columnId, String columnCaption, FieldInterfaced fieldInterfaced) {
    return Column.builder()
        .id(columnId)
        .caption(columnCaption)
        .type(fieldTypeMapper.mapColumnType(fieldInterfaced))
        .stereotype("column")
        .attributes(List.of())
        .width(fieldTypeMapper.getWidth(fieldInterfaced))
        .build();
  }

  private SearchForm buildSearchForm(Listing rpcView, String listId) {
    return SearchForm.builder().fields(buildSearchFields(rpcView, listId)).build();
  }

  private List<Field> buildSearchFields(Listing rpcView, String listId) {
    Class searchFormClass = rpcView.getSearchFormClass();
    List<FieldInterfaced> allEditableFields =
        reflectionHelper.getAllEditableFields(searchFormClass);
    if (rpcView instanceof RpcCrudViewExtended) {
      List<String> validFieldIds =
          ((RpcCrudViewExtended) rpcView)
              .getFilterFields().stream().map(f -> f.getId()).collect(Collectors.toList());
      if (validFieldIds.size() > 0) {
        List<FieldInterfaced> finalAllEditableFields = allEditableFields;
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
    return allEditableFields.stream()
        .map(fieldInterfaced -> fieldMetadataBuilder.getField(rpcView, fieldInterfaced))
        .map(
            f -> {
              f.setId(listId + "-" + f.getId());
              return f;
            })
        .collect(Collectors.toList());
  }
}
