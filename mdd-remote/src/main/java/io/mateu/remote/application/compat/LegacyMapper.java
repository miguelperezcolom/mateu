package io.mateu.remote.application.compat;

import io.mateu.remote.application.compat.dtos.*;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class LegacyMapper {

    public String map(Component c) throws Exception {
        if (!(c.getMetadata() instanceof Crud)) {
            return null;
        }

        Crud crud = (Crud) c.getMetadata();

        return Helper.toJson(LegacyTable.builder()
                        .action_buttons(List.of())
                        .additional_filters(createAdditionalFilters(crud))
                        .additional_needed_data(List.of())
                        .expandable_config(ExpandableConfig.builder().build())
                        .column_headers(createColumnHeaders(crud))
                        .list_type("mateu")
                        .lokalise_prefix("_LIST_")
                        .loader_text("Loading data...")
                        .no_results_message(Message.builder()
                                .title("No data")
                                .subtitle("Please try with other filters")
                                .build())
                        .page_size_options(List.of(10, 10, 30, 40, 50))
                        .row_t_selector("mateu_list_row_")
                        .searchbar_options(SearchBarOptions.builder()
                                .i18nPrefixKey("_COL_mateu_")
                                .build())
                        .type("table")
                .build());
    }

    private List<ColumnHeader> createColumnHeaders(Crud crud) {
        List<String> searchFormFieldIds = crud.getSearchForm().getFields().stream().map(f -> f.getId())
                .collect(Collectors.toList());
        Column firstColumn = crud.getColumns().size() > 0?crud.getColumns().get(0):null;
        List<ColumnHeader> headers = crud.getColumns().stream().map(c -> ColumnHeader.builder()
                .cell(Cell.builder()
                        .displayKey(c.getId())
                        .options(firstColumn.getId().equals(c.getId())?CellOptions.builder()
                                .eventName(c.getId().toUpperCase() + "_CLICKED")
                                .build():CellOptions.builder()
                                .build())
                        .tSelector(c.getId() + "_")
                        .type("CELL_STRING_ACTION")
                        .build())
                .clickable(firstColumn.getId().equals(c.getId()))
                .headerLabel(c.getCaption())
                .filter(searchFormFieldIds.contains(c.getId()))
                        .filterConfig(createFilterConfig(c, crud, searchFormFieldIds))
                .showColumn(true)
                .sort(true)
                .sortKey(c.getId())
                .target_data(List.of(c.getId()))
                .tSelector(c.getId() + "_header")
                .build())
                .collect(Collectors.toList());
        return headers;
    }

    private FilterConfig createFilterConfig(Column c, Crud crud, List<String> searchFormFieldIds) {
        if (!searchFormFieldIds.contains(c.getId())) {
            return null;
        }
        Field field = crud.getSearchForm().getFields().stream().filter(f -> f.getId().equals(c.getId()))
                .findFirst().orElse(null);
        FilterConfig.FilterConfigBuilder builder = FilterConfig.builder()
                .key(c.getId())
                .name(c.getId());
        if ("enum".equals(field.getType())) {
            builder.type("FILTER_SINGLE_OPTION");
            builder.options(field.getAttributes().stream().filter(a -> "choice".equals(a.getKey()))
                    .map(a -> (Value) a.getValue())
                    .map(v -> FilterConfigOption.builder()
                            .label("" + v.getKey())
                            .value("" + v.getValue())
                            .build())
                    .collect(Collectors.toList()));
        } else if ("multiple".equals(field.getStereotype())) {
            //todo: implement this
            builder.type("FILTER_MULTIPLE_OPTION");
        } else if ("DatesRange".equals(field.getType())) {
            builder.type("FILTER_RANGE_DATE");
        } else {
            builder.type("FILTER_STRING");
        }
        return builder.build();
    }

    private List<AdditionalFilter> createAdditionalFilters(Crud crud) {
        List<AdditionalFilter> additionalFilters = new ArrayList<>();
        //todo: esto parece que son filtros que deben aparecer debajo de search, pero no en las columnas
        List<String> columnIds = crud.getColumns().stream().map(c -> c.getId()).collect(Collectors.toList());
        additionalFilters.addAll(crud.getSearchForm().getFields().stream()
                .skip(1)
                .filter(f -> !columnIds.contains(f.getId()))
                .map(f -> createAdditionalFilter(f))
                .collect(Collectors.toList()));
        return additionalFilters;
    }

    private AdditionalFilter createAdditionalFilter(Field f) {
        AdditionalFilter.AdditionalFilterBuilder builder = AdditionalFilter.builder()
                .controlName(f.getId())
                .defaultValue(f.getPlaceholder())
                .optionPanelModifiers("-compact");
        if ("".equals(f.getType())) {
            builder.sourceName(f.getId())
                    .sources(List.of(Source.builder()
                            .name(f.getId())
                            .values(f.getAttributes().stream().filter(a -> "choice".equals(a.getKey()))
                                    .flatMap(a -> ((List<Value>) a.getValue()).stream())
                                    .map(v -> Value.builder()
                                            .key(v.getKey())
                                            .value("" + v.getValue())
                                            .build())
                                    .collect(Collectors.toList()))
                            .build()));
        }
        return builder.build();
    }

}
