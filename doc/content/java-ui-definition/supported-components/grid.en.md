---
title: "Grid"
weight: 100
---


A grid is the equivalent for the html table, but with steroids.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "Grid",
    "content": [
      {
        "type": "ClientSide",
        "metadata": {
          "type": "GridColumn",
          "id": "id",
          "label": "Id",
          "dataType": "string",
          "stereotype": "regular",
          "sortable": false,
          "filterable": false,
          "frozen": false,
          "frozenToEnd": false,
          "autoWidth": false,
          "resizable": false
        },
        "id": "id"
      },
      {
        "type": "ClientSide",
        "metadata": {
          "type": "GridColumn",
          "id": "name",
          "label": "Name",
          "dataType": "string",
          "stereotype": "regular",
          "sortable": false,
          "filterable": false,
          "frozen": false,
          "frozenToEnd": false,
          "autoWidth": false,
          "resizable": false
        },
        "id": "name"
      },
      {
        "type": "ClientSide",
        "metadata": {
          "type": "GridColumn",
          "id": "age",
          "label": "Age",
          "dataType": "string",
          "stereotype": "regular",
          "sortable": false,
          "filterable": false,
          "frozen": false,
          "frozenToEnd": false,
          "autoWidth": false,
          "resizable": false
        },
        "id": "age"
      }
    ],
    "page": {
      "items": [
        {
          "name": "Mateu",
          "age": "17",
          "id": "1"
        },
        {
          "name": "Antònia",
          "age": "49",
          "id": "2"
        },
        {
          "name": "Miguel",
          "age": "56",
          "id": "3"
        }
      ],
      "totalElements": 3
    },
    "tree": false
  }
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    Grid.builder()
        .content(List.of(
                GridColumn.builder().id("id").label("Id").build(),
                GridColumn.builder().id("name").label("Name").build(),
                GridColumn.builder().id("age").label("Age").build()
        ))
        .page(new Page<>(10, 1, 3, List.of(
                Map.of("id", "1", "name", "Mateu", "age", "17"),
                Map.of("id", "2", "name", "Antònia", "age", "49"),
                Map.of("id", "3", "name", "Miguel", "age", "56")
        )))
        .build()


```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a crud:

| Property       | Description                | Notes                          |
|----------------|----------------------------|--------------------------------|
| **id**         | id for this component      |                                |
| **cssClasses** | list of css classes        | content of the css attribute   |
| **style**      | inline style attributes    | content of the style attribute |
| **fullWidth**  | shortcut to set width:100% | true/false                     |
| **content**    | columns                    |                                |    
| **page**       | the items                  |                                |    


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/grid

