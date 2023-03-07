package io.mateu.remote.domain;

import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Width;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class CrudMetadataBuilder extends AbstractMetadataBuilder {

    public Crud build(RpcView rpcView) {
        return Crud.builder()
                .title(getTitle(rpcView))
                .searchForm(buildSearchForm(rpcView))
                .columns(buildColumns(rpcView))
                .actions(getActions(rpcView))
                .build();
    }

    private String getTitle(RpcView rpcView) {
        if (rpcView.getClass().isAnnotationPresent(Caption.class)) {
            return rpcView.getClass().getAnnotation(Caption.class).value();
        }
        try {
            if (!rpcView.getClass().getMethod("toString").getDeclaringClass().equals(Object.class)) {
                return rpcView.toString();
            }
        } catch (NoSuchMethodException e) {
        }
        return Helper.capitalize(rpcView.getClass().getSimpleName());
    }


    private List<Column> buildColumns(RpcView rpcView) {
        Class rowClass = rpcView.getSearchFormClass();
        List<FieldInterfaced> allRowFields = ReflectionHelper.getAllFields(rowClass);
        return allRowFields.stream().map(fieldInterfaced -> getColumn(fieldInterfaced))
                .collect(Collectors.toList());
    }

    private Column getColumn(FieldInterfaced fieldInterfaced) {
        return Column.builder()
                .id(fieldInterfaced.getId())
                .caption(ReflectionHelper.getCaption(fieldInterfaced))
                .type(getType(fieldInterfaced))
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
        return allEditableFields.stream().map(fieldInterfaced -> getField(fieldInterfaced))
                .collect(Collectors.toList());
    }

}
