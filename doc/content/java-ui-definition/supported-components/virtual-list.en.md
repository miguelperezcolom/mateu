---
title: "Virtual List"
weight: 100
---

A list with infinite scrolling.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: 10rem;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "VirtualList",
    "page": {
      "items": [
        {
          "type": "ClientSide",
          "metadata": {
            "type": "Text",
            "container": "div",
            "text": "Item 1"
          },
          "id": "fieldId"
        },
        {
          "type": "ClientSide",
          "metadata": {
            "type": "Text",
            "container": "div",
            "text": "Item 2"
          },
          "id": "fieldId"
        },
        {
          "type": "ClientSide",
          "metadata": {
            "type": "Text",
            "container": "div",
            "text": "Item 3"
          },
          "id": "fieldId"
        }
      ],
      "totalElements": 3
    }
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

 VirtualList.builder()
            .page(new Page<>(10, 1, 3, List.of(
                    new Text("Item 1"),
                    new Text("Item 2"),
                    new Text("Item 3")
            )))
            .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a virtual list component:

| Property       | Description             | Notes                          |
|----------------|-------------------------|--------------------------------|
| **id**         | id for this component   |                                |
| **cssClasses** | list of css classes     | content of the css attribute   |
| **style**      | inline style attributes | content of the style attribute |
| **page**       | the virtual list items  |                                |

You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/virtual-list



