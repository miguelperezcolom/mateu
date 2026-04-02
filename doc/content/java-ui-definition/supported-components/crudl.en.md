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

record Filters(int age) {}
@Serdeable
record Row(String name, int age) {}

@Route("/crudls/basic")
@Slf4j
@RequiredArgsConstructor
public class BasicCrudl implements ComponentTreeSupplier, ReactiveCrudlBackend<Filters, Row> {

  private final Service service;

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
          .build()
      ))
      .searchable(true)
      .columns(List.of(
        GridColumn.builder()
          .id("name")
          .label("Name")
          .build(),
        GridColumn.builder()
          .id("age")
          .label("Age")
          .build()
      ))
      .emptyStateMessage("Please search.")
      .build();
  }

  @Override
  public Class<Filters> filtersClass() {
    return Filters.class;
  }

  @Override
  public Mono<CrudlData<Row>> search(String searchText, Filters filters, Pageable pageable, HttpRequest httpRequest) {
    return service.search(searchText, filters, pageable).map(page -> new CrudlData<>(page,
      "No items found. Please try again."));
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








