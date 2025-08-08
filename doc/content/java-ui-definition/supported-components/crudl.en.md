---
title: "CRUDL"
weight: 100
---


You already know what a crudl is. A crudl is the acronym from (create, read, update, delete and list) and it is the 
typical list we see in all enterprise applications.

The crud is composed of a search bar, filters, data and pagination.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "TableCrud",
    "columns": [
      {
        "id": "name",
        "dataType": "string",
        "header": "Name",
        "detail": false,
        "sortable": false,
        "serverSideSortable": false
      },
      {
        "id": "age",
        "dataType": "string",
        "header": "Age",
        "detail": false,
        "sortable": false,
        "serverSideSortable": false
      }
    ],
    "title": "Basic crudl",
    "canEdit": false,
    "selectionListened": false,
    "hasActionOnSelectedRow": false,
    "multipleRowSelectionEnabled": false,
    "searchable": true,
    "showCards": false,
    "filters": [
      {
        "type": "FormField",
        "fieldId": "age",
        "dataType": "integer",
        "stereotype": "regular",
        "observed": false,
        "autofocus": false,
        "label": "Age",
        "colspan": 0,
        "rightAligned": false,
        "bold": false,
        "bindToData": false,
        "required": false
      }
    ],
    "child": false
  },
  "id": "crud"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

@Route("/fluent-app/crudls/basic")
@Slf4j
public class BasicCrudl implements ComponentTreeSupplier, ReactiveHandlesActions {

    CrudData crud = new CrudData(new Page<Object>(0, 0, List.of()));

    @Override
    public Crudl getComponent(HttpRequest httpRequest) {
        return Crudl.builder() // vertical layout as default container for children
                .title("Basic crudl")
                .id("crud")
                .filters(List.of(
                        FormField.builder()
                                .id("age")
                                .label("Age")
                                .dataType(FieldDataType.integer)
                                .bindToData(true)
                                .build()
                ))
                .searchable(true)
                .columns(List.of(
                        Column.builder()
                                .id("name")
                                .label("Name")
                                .build(),
                        Column.builder()
                                .id("age")
                                .label("Age")
                                .build()
                ))
                .build();
    }

    @Override
    public boolean supportsAction(String actionId) {
        return !"".equals(actionId);
    }

    @Override
    public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
        log.info("received action: " + actionId);

        this.crud = new CrudData(new Page<Object>(
                1,
                2,
                List.of(
                        Map.of("name", "Mateu", "age", 17),
                        Map.of("name", "Antonia", "age", 49)
                )));

        return Mono.just(new State(this));
    }
}

```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a crud:

| Property         | Description                                                                              | Notes                          |
|------------------|------------------------------------------------------------------------------------------|--------------------------------|
| **id**           | id for this component                                                                    |                                |
| **cssClasses**   | list of css classes                                                                      | content of the css attribute   |
| **style**        | inline style attributes                                                                  | content of the style attribute |
| **fullWidth**    | shortcut to set width:100%                                                               | true/false                     |
| **crudlType**    | One of grid, cards                                                                       |                      |








