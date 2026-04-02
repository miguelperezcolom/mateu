---
title: "Tooltip"
weight: 100
---



A tooltip. Just wrap any other component and provide the tooltip text.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: 10rem;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "Tooltip",
    "text": "Hello tooltip",
    "wrapped": {
      "type": "ClientSide",
      "metadata": {
        "type": "Text",
        "container": "div",
        "text": "Hover me!"
      },
      "id": "fieldId"
    }
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

 Tooltip.builder()
        .text("Hello tooltip")
        .wrapped(new Text("Hover me!"))
        .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

There is no declarative thing for scrollers. Just use a scroller record as in imperative.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a popover component:

| Property       | Description             | Notes                          |
|----------------|-------------------------|--------------------------------|
| **id**         | id for this component   |                                |
| **cssClasses** | list of css classes     | content of the css attribute   |
| **style**      | inline style attributes | content of the style attribute |
| **wrapped**    | the tooltip owner       |                                |
| **text**       | the tooltip text        |                                |

You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/tooltip



