package com.example.demo.ddd.infra.in.ui.pages.shared;

import com.example.demo.ddd.infra.out.persistence.hotel.shared.Repository;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.PrimaryKey;
import io.mateu.uidl.annotations.ViewToolbarButton;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonVariant;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.Sort;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.fluent.ListingType;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.OnSuccessTrigger;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.DataSupplier;
import io.mateu.uidl.interfaces.ForeignKeyOptionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import io.mateu.uidl.interfaces.RouteHandler;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static io.mateu.core.application.runaction.RunActionUseCase.wrap;
import static io.mateu.core.domain.Humanizer.toUpperCaseFirst;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.*;
import static io.mateu.core.infra.JsonSerializer.*;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.FieldByNameProvider.getFieldByName;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;
import static io.mateu.uidl.data.UICommand.pushStateToHistory;
import static io.mateu.uidl.reflection.GenericClassProvider.getGenericClass;

@Slf4j
public abstract class ExtendedGenericCrud<EntityType, Filters, Row, CreationForm, ViewForm, EditForm>
        implements ActionHandler, DataSupplier, TriggersSupplier, ActionSupplier, RouteHandler {


    @Override
    public Object data(HttpRequest httpRequest) {
        if (httpRequest.getAttribute("selectedItem") != null) {
            var data = fromJson(toJson(this));
            data.putAll(fromJson(toJson(httpRequest.getAttribute("selectedItem"))));
            return data;
        }
        return this;
    }

    public abstract Repository<EntityType, String> repository();

    @SneakyThrows
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if (actionId.startsWith("action-on-row-")) {
            String methodName = actionId.substring("action-on-row-".length());
            for (Method method : getAllMethods(getClass())) {
                if (methodName.equals(method.getName())) {
                    method.setAccessible(true);
                    method.invoke(this, httpRequest);
                    break;
                }
            }
        }
        if (actionId.startsWith("action-on-view-")) {
            String methodName = actionId.substring("action-on-view-".length());
            var idField = getIdField(entityClass());

            var found = repository().findById((String) httpRequest.runActionRq().componentState().get(idField));
            if (found.isEmpty()) {
                throw new RuntimeException("No item found with id " + httpRequest.runActionRq().parameters().get(idField));
            }
            var item = found.get();


            for (Method method : getAllMethods(getClass())) {
                if (methodName.equals(method.getName())) {
                    method.setAccessible(true);
                    if (method.getParameterCount() == 1) {
                        return method.invoke(this, item);
                    }
                    if (method.getParameterCount() == 2) {
                        return method.invoke(this, item, httpRequest);
                    }
                }
            }
        }
        if (actionId.startsWith("search-")) {
            String fieldName = actionId.substring(actionId.indexOf('-') + 1);
            var fkAnnotation = getFieldByName(entityClass(), fieldName).getAnnotation(ForeignKey.class);
            ForeignKeyOptionsSupplier optionsSupplier = MateuBeanProvider.getBean(fkAnnotation.search());

            Pageable pageable = httpRequest.getParameters(Pageable.class);
            String searchText = (String) httpRequest.runActionRq().parameters().get("searchText");
            if (searchText == null) {
                searchText = "";
            }
            var cleanSearchText = searchText.toLowerCase();

            var listingData = optionsSupplier.search(cleanSearchText, pageable, httpRequest);

            return new Data(Map.of(fieldName, listingData.page()));
        }

        if ("create".equals(actionId)) {
            repository().saveAll(List.of(pojoFromJson(toJson(httpRequest.runActionRq().componentState()), entityClass())));
        }
        if ("save".equals(actionId)) {
            repository().saveAll(List.of(pojoFromJson(toJson(httpRequest.runActionRq().componentState()), entityClass())));
        }
        if ("delete".equals(actionId)) {
            List<?> selection = (List<?>) httpRequest.runActionRq().componentState().getOrDefault("crud_selected_items", List.of());
            List<String> selectedIds = selection.stream()
                    .map(map -> (String) ((Map<String, Object>)map).get(getIdField(rowClass())))
                    .toList();
            repository().deleteAllById(selectedIds);
        }
        if ("view".equals(actionId)) {
            var idField = getIdField(entityClass());
            var id = (String) httpRequest.runActionRq().parameters().get(idField);
            return List.of(view(id, httpRequest), pushStateToHistory(getCrudRoute(httpRequest) + "/" +  id));
        }
        if ("edit".equals(actionId)) {
            var idField = getIdField(entityClass());
            var id = (String) httpRequest.runActionRq().componentState().get(idField);

            return List.of(edit(id, httpRequest), pushStateToHistory(getCrudRoute(httpRequest) + "/" +  id + "/edit"));
        }
        if ("new".equals(actionId)) {
            return List.of(create(httpRequest), pushStateToHistory(getCrudRoute(httpRequest) + "/new"));
        }
        if ("search".equals(actionId)) {
            String searchText = (String) httpRequest.runActionRq().componentState().get("searchText");
            Pageable pageable = new Pageable(
                    (Integer) httpRequest.runActionRq().componentState().get("page"),
                    (Integer) httpRequest.runActionRq().componentState().get("size"),
                    (List<Sort>) httpRequest.runActionRq().componentState().get("sort")
            );
            if (searchText == null) {
                searchText = "";
            }
            return new Data(Map.of("crud", repository().search(searchText, pageable)));
        }
        var toolbar = new ArrayList<UserTrigger>();
        addButtons(toolbar);
        toolbar.add(new Button("New", "new"));
        if (Deleteable.class.isAssignableFrom(entityClass())) {
            toolbar.add(Button.builder()
                    .label("Delete")
                    .actionId("delete")
                    .variant(ButtonVariant.error)
                    .build());
        }
        var columns = Stream.concat(getColumns(rowClass(), this, "base_url", httpRequest.runActionRq().route(), httpRequest.runActionRq().initiatorComponentId(), httpRequest)
                                .stream()
                        , Stream.of(GridColumn.builder()
                                .label("Action")
                                .id("_action")
                                .stereotype(FieldStereotype.link)
                                .actionId("view")
                                .text("View")
                                .build()))
                .toList();
        return List.of(wrap(
                Page.builder()
                        .title(toUpperCaseFirst(getClass().getSimpleName()))
                        .style(columns.size() > 5?"width: 100%;":"max-width:900px;margin: auto;")
                        .content(List.of(
                                Listing.builder()
                                        .listingType(ListingType.table)
                                        .title("Xxx")
                                        .searchable(true)
                                        .rowsSelectionEnabled(true)
                                        .columns(columns)
                                        .filters(getFilters(filtersClass(), this, "base_url", httpRequest.runActionRq().route(), httpRequest.runActionRq().consumedRoute(), httpRequest.runActionRq().initiatorComponentId(), httpRequest))
                                        .style("min-width: 30rem; display: block;")
                                        .build()
                                ))
                        .toolbar(toolbar)
                        .build(),
                this,
                "base_url",
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                httpRequest
        ), pushStateToHistory(getCrudRoute(httpRequest)));
    }

    private Object create(HttpRequest httpRequest) {
        return wrap(
                Page.builder()
                        .title("New " + toUpperCaseFirst(entityClass().getSimpleName()))
                        .style("max-width:900px;margin: auto;")
                        .content(
                                getForm(
                                        MateuInstanceFactory.newInstance(entityClass(), Map.of(), null),
                                        "base_url",
                                        httpRequest.runActionRq().route(),
                                        httpRequest.runActionRq().consumedRoute(),
                                        httpRequest.runActionRq().initiatorComponentId(),
                                        httpRequest,
                                        true
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

    private Object edit(String id, HttpRequest httpRequest) {
        var found = repository().findById(id);
        if (found.isEmpty()) {
            throw new RuntimeException("No item found with id " + id);
        }
        var item = found.get();
        httpRequest.setAttribute("selectedItem", mapToRow(item));
        return wrap(
                Page.builder()
                        .title(toUpperCaseFirst(entityClass().getSimpleName()) + " " + getEntityName(item))
                        .style("max-width:900px;margin: auto;")
                        .content(
                                getForm(
                                        item,
                                        "base_url",
                                        httpRequest.runActionRq().route(),
                                        httpRequest.runActionRq().consumedRoute(),
                                        httpRequest.runActionRq().initiatorComponentId(),
                                        httpRequest,
                                        false
                                ).stream().toList()
                        )
                        .toolbar(List.of(new Button("Save", "save")))
                        .build(),
                this,
                "base_url",
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                addData(item, httpRequest)
        );
    }

    private Object view(String id, HttpRequest httpRequest) {
        var found = repository().findById(id);
        if (found.isEmpty()) {
            throw new RuntimeException("No item found with id " + id);
        }
        var item = found.get();
        httpRequest.setAttribute("selectedItem", mapToRow(item));
        var toolbar = createViewToolbar();
        return wrap(
                Page.builder()
                        .title(toUpperCaseFirst(entityClass().getSimpleName()) + " " + getEntityName(item))
                        .style("max-width:900px;margin: auto;")
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
                        .toolbar(toolbar)
                        .build(),
                this,
                "base_url",
                httpRequest.runActionRq().route(),
                httpRequest.runActionRq().consumedRoute(),
                httpRequest.runActionRq().initiatorComponentId(),
                addData(item, httpRequest)
        );
    }

    private String getCrudRoute(HttpRequest httpRequest) {
        return "/" + httpRequest.runActionRq().route().split("/")[1];
    }

    private List<UserTrigger> createViewToolbar() {
        var toolbar = new ArrayList<UserTrigger>();
        getAllMethods(getClass())
                .stream().filter(method -> method.isAnnotationPresent(ViewToolbarButton.class))
                .forEach(method -> {
                    toolbar.add(new Button(toUpperCaseFirst(method.getName()), "action-on-view-" + method.getName()));
                });
        toolbar.add(new Button("Edit", "edit"));
        return toolbar;
    }

    private void addButtons(ArrayList<UserTrigger> toolbar) {
        getAllMethods(getClass())
                .stream().filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
                .forEach(method -> {
            toolbar.add(Button.builder()
                    .label(toUpperCaseFirst(method.getName()))
                    .actionId("action-on-row-" + method.getName())
                    .build());
        });
    }

    private HttpRequest addData(EntityType item, HttpRequest httpRequest) {
        if (item == null) {
            return httpRequest;
        }
        var data = new HashMap<String, Object>();
        getAllFields(entityClass()).stream().filter(field -> field.isAnnotationPresent(ForeignKey.class)).forEach(field -> {
            LabelSupplier labelSupplier = MateuBeanProvider.getBean(field.getAnnotation(ForeignKey.class).label());
            if (Collection.class.isAssignableFrom(field.getType())) {
                var options = new ArrayList<>();

                var ids = (Collection<?>) getValue(field, item);
                if (ids != null) {
                    ids.forEach(id -> {
                        var label = labelSupplier.label(id, httpRequest);
                        options.add(new Option(id, label));
                    });
                }

                data.put(field.getName(),
                        new io.mateu.uidl.data.Page<>("xxxx", 1, 0, 1,
                                options));
            } else {
                var id = getValue(field, item);
                if (id != null) {
                    var label = labelSupplier.label(id, httpRequest);
                    data.put(field.getName(),
                            new io.mateu.uidl.data.Page<>("xxxx", 1, 0, 1,
                                    List.of(new Option(id, label))));
                }
            }
        });
        httpRequest.setAttribute("data", data);
        return httpRequest;
    }

    private String getEntityName(EntityType item) {
        if (item == null) {
            return "No item found";
        }
        Object name = null;
        try {
            name = getValue(getFieldByName(item.getClass(), "name"), item);
            if (name != null) {
                return "" + name;
            }
        } catch (Exception ignored) {
        }
        try {
            name = getValue(getFieldByName(item.getClass(), getIdField(item.getClass())), item);
            if (name != null) {
                return "" + name;
            }
        } catch (Exception ignored) {
        }
        return item.toString();
    }

    private String getIdField(Class<?> entityClass) {
        boolean hasIdField = false;
        String firstField = null;
        for (Field field : getAllFields(entityClass)) {
            if (field.isAnnotationPresent(PrimaryKey.class)) {
                return field.getName();
            }
            hasIdField |= "id".equals(field.getName());
            if (firstField == null) {
                firstField = field.getName();
            }
        }
        return hasIdField ? "id": firstField;
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

    @Override
    public List<Trigger> triggers() {
        var triggers = new ArrayList<Trigger>();
        triggers.add(new OnLoadTrigger("search"));
        triggers.add(new OnSuccessTrigger("search", "create", ""));
        triggers.add(new OnSuccessTrigger("search", "delete", ""));
        triggers.add(new OnSuccessTrigger("search", "save", ""));
        getAllMethods(getClass())
                .stream().filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
                .forEach(method -> {
                    triggers.add(new OnSuccessTrigger("search",
                            "action-on-row-" + method.getName(), ""));
                });
        return triggers;
    }

    @Override
    public List<Action> actions() {
        var actions = new ArrayList<Action>();
        actions.add(
                Action.builder()
                        .id("delete")
                        .confirmationRequired(true)
                        .rowsSelectedRequired(true)
                        .build()
        );
        getAllMethods(getClass())
                .stream().filter(method -> method.isAnnotationPresent(ListToolbarButton.class))
                .forEach(method -> {
                    actions.add(Action.builder()
                            .id("action-on-row-" + method.getName())
                            .confirmationRequired(true)
                            .rowsSelectedRequired(true)
                            .build());
                });
        return actions;
    }

    @Override
    public Object handleRoute(String route, HttpRequest httpRequest) {
        log.info("route is {}", route);
        if (httpRequest.runActionRq().actionId() == null || "".equals(httpRequest.runActionRq().actionId())) {
            var crudRoute = getCrudRoute(httpRequest);
            var actionId = route.substring(crudRoute.length());
            if (actionId.startsWith("/")) {
                actionId = actionId.substring(1);
            }
            if (!"".equals(actionId)) {
                if ("new".equals(actionId)) {
                    return create(httpRequest);
                }
                if (actionId.endsWith("edit")) {
                    return edit(actionId.split("/")[0], httpRequest);
                }
                return view(actionId, httpRequest);
            }
        }
        return this;
    }
}
