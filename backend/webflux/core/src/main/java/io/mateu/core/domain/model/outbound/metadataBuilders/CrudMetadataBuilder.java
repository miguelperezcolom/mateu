package io.mateu.core.domain.model.outbound.metadataBuilders;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.dynamic.DynamicCrud;
import io.mateu.core.domain.model.outbound.metadataBuilders.fields.FieldTypeMapper;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.*;
import io.mateu.uidl.core.annotations.Child;
import io.mateu.uidl.core.annotations.Detail;
import io.mateu.uidl.core.annotations.Ignored;
import io.mateu.uidl.core.interfaces.HasSubtitle;
import io.mateu.uidl.core.interfaces.Listing;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class CrudMetadataBuilder {

  final ActionMetadataBuilder actionMetadataBuilder;
  final FieldMetadataBuilder fieldMetadataBuilder;
  final FieldTypeMapper fieldTypeMapper;
  final ReflectionService reflectionService;
  final CaptionProvider captionProvider;
  private final FormMetadataBuilder formMetadataBuilder;

  @SneakyThrows
  // todo: this builder is based on reflection. Consider adding a dynamic one and cache results
  public Crud build(String listId, Object crudInstance) {

    if (crudInstance instanceof DynamicCrud) {
      return ((DynamicCrud) crudInstance).build().toFuture().get();
    }

    var rpcView = (Listing) crudInstance;

    return new Crud(
        captionProvider.getCaption(rpcView),
        getSubtitle(rpcView),
        reflectionService.isOverridden(rpcView, "getDetail"),
        reflectionService.isOverridden(rpcView, "onRowSelected"),
        rpcView.hasActionOnSelectedRow(reflectionService),
        rpcView.showCheckboxForSelection(reflectionService),
        rpcView.isSearchable(),
        rpcView.isShowCards(),
        buildSearchForm(rpcView, listId),
        buildColumns(rpcView),
        actionMetadataBuilder.getActions(listId, rpcView),
        rpcView.getClass().isAnnotationPresent(Child.class));
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
      allRowFields = reflectionService.getAllFields(rowClass);
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
    return new Column(
        columnId,
        fieldTypeMapper.mapColumnType(field),
        "column",
        columnCaption,
        "",
        fieldTypeMapper.getWidth(field),
        List.of(),
        field.isAnnotationPresent(Detail.class));
  }

  @SneakyThrows
  private Component buildSearchForm(Listing rpcView, String listId) {
    List<String> allComponents = new ArrayList<>();
    var form =
        formMetadataBuilder.build(
            reflectionService.newInstance(rpcView.getSearchFormClass()), List.of(), Map.of());
    var component =
        new GenericComponent(
            new Form(
                form.icon(),
                "",
                false,
                "",
                null,
                form.badges(),
                form.tabs(),
                form.banners(),
                form.sections().stream()
                    .map(
                        s ->
                            new Section(
                                s.id(),
                                s.tabId(),
                                s.caption(),
                                s.description(),
                                s.readOnly(),
                                SectionType.Transparent,
                                s.leftSideImageUrl(),
                                s.topImageUrl(),
                                s.fieldGroups(),
                                s.columns()))
                    .toList(),
                List.of(), // form.actions(),
                List.of(), // form.mainActions(),
                form.validations(),
                form.rules()),
            "filtersForm",
            rpcView.getSearchFormClass().getName(),
            Map.of(),
            Map.of(),
            allComponents);
    return component;
  }

  private List<io.mateu.dtos.Field> buildSearchFields(Listing rpcView, String listId) {
    Class searchFormClass = rpcView.getSearchFormClass();
    List<Field> allEditableFields = reflectionService.getAllEditableFields(searchFormClass);
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
                f ->
                    new io.mateu.dtos.Field(
                        f.id(),
                        f.type(),
                        f.stereotype(),
                        f.observed(),
                        f.wantsFocus(),
                        f.caption(),
                        f.placeholder(),
                        f.cssClasses(),
                        f.description(),
                        f.badges(),
                        f.validations(),
                        f.attributes(),
                        f.colspan()))
            .toList();

    if ("JpaRpcCrudView".equals(rpcView.getClass().getSimpleName()))
      filterFields =
          Stream.concat(
                  Stream.of(
                      new io.mateu.dtos.Field(
                          listId + "-" + "_search-text",
                          "string",
                          "input",
                          false,
                          true,
                          "Search",
                          "Search",
                          null,
                          null,
                          List.of(),
                          List.of(),
                          List.of(),
                          1)),
                  filterFields.stream())
              .toList();
    return filterFields;
  }
}
