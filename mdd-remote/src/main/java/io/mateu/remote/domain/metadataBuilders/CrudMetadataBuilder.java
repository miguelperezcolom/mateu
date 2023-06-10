package io.mateu.remote.domain.metadataBuilders;

import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.mdd.shared.annotations.Width;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.metadataBuilders.fields.FieldTypeMapper;
import io.mateu.remote.dtos.*;
import io.mateu.remote.dtos.Crud;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CrudMetadataBuilder {

    @Autowired
    ActionMetadataBuilder actionMetadataBuilder;

    @Autowired
    FieldMetadataBuilder fieldMetadataBuilder;

    @Autowired
    FieldTypeMapper fieldTypeMapper;

    //todo: this builder is based on reflection. Consider adding a dynamic one and cache results
    public Crud build(String stepId, String listId, Listing rpcView) {
        return Crud.builder()
                .title(getTitle(rpcView))
                .subtitle(getSubtitle(rpcView))
                .canEdit(ReflectionHelper.isOverridden(rpcView, "getDetail"))
                .searchForm(buildSearchForm(rpcView))
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
            allRowFields = ReflectionHelper.getAllFields(rowClass);
        }
        return allRowFields.stream()
                .filter(fieldInterfaced -> !fieldInterfaced.isAnnotationPresent(Ignored.class))
                .map(fieldInterfaced -> getColumn(
                        columnIdsPerField.getOrDefault(fieldInterfaced, fieldInterfaced.getId()),
                        columnCaptionsPerField.getOrDefault(fieldInterfaced,
                                ReflectionHelper.getCaption(fieldInterfaced)),
                        fieldInterfaced))
                .collect(Collectors.toList());
    }

    private Column getColumn(String columnId, String columnCaption, FieldInterfaced fieldInterfaced) {
        return Column.builder()
                .id(columnId)
                .caption(columnCaption)
                .type(mapColumnType(fieldInterfaced))
                .stereotype("column")
                .attributes(List.of())
                .width(getWidth(fieldInterfaced))
                .build();
    }

    private String mapColumnType(FieldInterfaced field) {
        if (field.isAnnotationPresent(io.mateu.mdd.shared.annotations.Status.class)) {
            return io.mateu.remote.dtos.Status.class.getSimpleName();
        }
        return fieldTypeMapper.mapFieldType(field);
    }

    private String getWidth(FieldInterfaced fieldInterfaced) {
        if (fieldInterfaced.isAnnotationPresent(Width.class)) {
            return fieldInterfaced.getAnnotation(Width.class).value();
        }
        return "150px";
    }

    private SearchForm buildSearchForm(Listing rpcView) {
        return SearchForm.builder()
                .fields(buildSearchFields(rpcView))
                .build();
    }

    private List<Field> buildSearchFields(Listing rpcView) {
        Class searchFormClass = rpcView.getSearchFormClass();
        List<FieldInterfaced> allEditableFields = ReflectionHelper.getAllEditableFields(searchFormClass);
        if (rpcView instanceof RpcCrudViewExtended) {
            List<String> validFieldIds = ((RpcCrudViewExtended) rpcView).getFilterFields().stream()
                    .map(f -> f.getId()).collect(Collectors.toList());
            if (validFieldIds.size() > 0) {
                allEditableFields = allEditableFields.stream().filter(f -> validFieldIds.contains(f.getId()))
                        .collect(Collectors.toList());
            }
        }
        return allEditableFields.stream().map(fieldInterfaced -> fieldMetadataBuilder.getField(rpcView, fieldInterfaced))
                .collect(Collectors.toList());
    }

}
