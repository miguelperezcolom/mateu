package io.mateu.remote.domain;

import io.mateu.mdd.core.interfaces.RpcCrudViewExtended;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Width;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;

import java.util.List;
import java.util.stream.Collectors;

public class CrudMetadataBuilder extends AbstractMetadataBuilder {

    public Crud build(RpcView rpcView) {
        return Crud.builder()
                .title(rpcView.getCaption())
                .searchForm(buildSearchForm(rpcView))
                .columns(buildColumns(rpcView))
                .actions(getActions(rpcView))
                .build();
    }

    private List<Column> buildColumns(RpcView rpcView) {
        Class rowClass = rpcView.getRowClass();
        List<FieldInterfaced> allRowFields = ReflectionHelper.getAllFields(rowClass);
        if (rpcView instanceof RpcCrudViewExtended) {
            List<String> validColumnIds = ((RpcCrudViewExtended) rpcView).getColumnFields();
            if (validColumnIds.size() > 0) {
                allRowFields = allRowFields.stream().filter(f -> validColumnIds.contains(f.getId()))
                        .collect(Collectors.toList());
            }
        }
        return allRowFields.stream().map(fieldInterfaced -> getColumn(fieldInterfaced))
                .collect(Collectors.toList());
    }

    private Column getColumn(FieldInterfaced fieldInterfaced) {
        return Column.builder()
                .id(fieldInterfaced.getId())
                .caption(ReflectionHelper.getCaption(fieldInterfaced))
                .type(getType(fieldInterfaced))
                .stereotype("column")
                .attributes(List.of())
                .width(getWidth(fieldInterfaced))
                .build();
    }

    private String getWidth(FieldInterfaced fieldInterfaced) {
        if (fieldInterfaced.isAnnotationPresent(Width.class)) {
            return fieldInterfaced.getAnnotation(Width.class).value();
        }
        return null;
    }

    private SearchForm buildSearchForm(RpcView rpcView) {
        return SearchForm.builder()
                .fields(buildSearchFields(rpcView))
                .build();
    }

    private List<Field> buildSearchFields(RpcView rpcView) {
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
        return allEditableFields.stream().map(fieldInterfaced -> getField(fieldInterfaced))
                .collect(Collectors.toList());
    }

}