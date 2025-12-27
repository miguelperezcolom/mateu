package com.example.demo.ddd.infra.in.ui.pages.shared;

import com.example.demo.ddd.domain.hotel.shared.Repository;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.fluent.ListingType;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.DataSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import lombok.SneakyThrows;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;
import static io.mateu.core.infra.JsonSerializer.*;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

@Trigger(type = TriggerType.OnLoad, actionId = "search")
public abstract class ExtendedGenericCrud<EntityType, Filters, Row, CreationForm, ViewForm, EditForm>
        implements ActionHandler, DataSupplier {

    private Row selectedItem;

    @Override
    public Object data() {
        if (selectedItem != null) {
            var data = fromJson(toJson(this));
            data.putAll(fromJson(toJson(selectedItem)));
            return data;
        }
        return this;
    }

    public abstract Repository<EntityType, String> repository();

    @SneakyThrows
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("create".equals(actionId)) {
            repository().saveAll(List.of(pojoFromJson(toJson(httpRequest.runActionRq().componentState()), entityClass())));
        }
        if ("save".equals(actionId)) {
            repository().saveAll(List.of(pojoFromJson(toJson(httpRequest.runActionRq().componentState()), entityClass())));
        }
        if ("".equals(actionId)) {
            return new Text("Hola no action");
        }
        if ("view".equals(actionId)) {
            var found = repository().findById((String) httpRequest.runActionRq().parameters().get("id"));
            if (found.isEmpty()) {
                throw new RuntimeException("No item found with id " + httpRequest.runActionRq().parameters().get("id"));
            }
            var item = found.get();
            selectedItem = mapToRow(item);
            return wrap(
                    Page.builder()
                            .content(
                                    getView(
                                            item,
                                            "base_url",
                                            httpRequest.runActionRq().route(),
                                            httpRequest.runActionRq().consumedRoute(),
                                            httpRequest.runActionRq().initiatorComponentId(),
                                            httpRequest
                                    ).stream().toList()
                            )
                            .toolbar(List.of(new Button("Edit", "edit")))
                            .build(),
                    this,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest
            );
        }
        if ("edit".equals(actionId)) {
            var found = repository().findById((String) getValue(getFieldByName(selectedItem.getClass(), "id"), selectedItem));
            if (found.isEmpty()) {
                throw new RuntimeException("No item found with id " + httpRequest.runActionRq().parameters().get("id"));
            }
            var item = found.get();
            selectedItem = mapToRow(item);
            return wrap(
                    Page.builder()
                            .content(
                                    getForm(
                                            item,
                                            "base_url",
                                            httpRequest.runActionRq().route(),
                                            httpRequest.runActionRq().consumedRoute(),
                                            httpRequest.runActionRq().initiatorComponentId(),
                                            httpRequest
                                    ).stream().toList()
                            )
                            .toolbar(List.of(new Button("Save", "save")))
                            .build(),
                    this,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest
            );
        }
        if ("new".equals(actionId)) {
            return wrap(
                    Page.builder()
                            .content(
                                    getForm(
                                            MateuInstanceFactory.newInstance(entityClass(), Map.of(), null),
                                            "base_url",
                                            httpRequest.runActionRq().route(),
                                            httpRequest.runActionRq().consumedRoute(),
                                            httpRequest.runActionRq().initiatorComponentId(),
                                            httpRequest
                                    ).stream().toList()
                            )
                            .toolbar(List.of(new Button("Create", "create")))
                            .build(),
                    this,
                    "base_url",
                    httpRequest.runActionRq().route(),
                    httpRequest.runActionRq().consumedRoute(),
                    httpRequest.runActionRq().initiatorComponentId(),
                    httpRequest
            );
        }
        if ("search".equals(actionId)) {
            return new Data(Map.of("crud", ListingData.of(repository().findAll()
                    //.stream()
                    //.map(entity -> new GenericRow(entity.id(), entity.name()))
                    //.toList()
            )));
        }
        return wrap(
                Page.builder()
                        .content(List.of(
                                Listing.builder()
                                        .listingType(ListingType.table)
                                        .title("Xxx")
                                        .searchable(true)
                                        .columns(Stream.concat(getColumns(rowClass(), this, "base_url", httpRequest.runActionRq().route(), httpRequest.runActionRq().initiatorComponentId(), httpRequest).stream()
                                                , Stream.of(GridColumn.builder()
                                                                .label("Action")
                                                                .stereotype(FieldStereotype.link)
                                                                .actionId("view")
                                                                .text("View")
                                                                .build()))
                                                .toList())
                                        .filters(getFilters(filtersClass(), this, "base_url", httpRequest.runActionRq().route(), httpRequest.runActionRq().consumedRoute(), httpRequest.runActionRq().initiatorComponentId(), httpRequest))
                                        .trigger(new OnLoadTrigger("search"))
                                        .style("min-width: 30rem; display: block;")
                                        .build()
                                ))
                        .toolbar(List.of(new Button("New", "new")))
                        .build(),
                this,
                "base_url",
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                httpRequest
        );
    }

    private Row mapToRow(EntityType item) {
        return (Row) item;
    }

    Class<Filters> filtersClass() {
        return getGenericClass(this.getClass(), ExtendedGenericCrud.class, "Filters");
    }

    Class<Row> rowClass() {
        return getGenericClass(this.getClass(), ExtendedGenericCrud.class, "Row");
    }

    Class<EntityType> entityClass() {
        return getGenericClass(this.getClass(), ExtendedGenericCrud.class, "EntityType");
    }

}
