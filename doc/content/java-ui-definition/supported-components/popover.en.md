---
title: "Popover"
weight: 100
---


A popover. Just wrap any component and define the popover content (e.g. a micro frontend).

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "Popover",
    "content": {
      "type": "ClientSide",
      "metadata": {
        "type": "Text",
        "container": "div",
        "text": "Popover content"
      },
      "id": "fieldId"
    },
    "wrapped": {
      "type": "ClientSide",
      "metadata": {
        "type": "Text",
        "container": "div",
        "text": "Click me!"
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

  Popover.builder()
          .wrapped(new Text("Click me!"))
          .content(new Text("Popover content"))
          .build()


```

{{< /tab >}}

{{< tab "Declarative" >}}

There is no declarative thing for popovers. Just use a popover record as in imperative.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a popover component:

| Property       | Description             | Notes                          |
|----------------|-------------------------|--------------------------------|
| **id**         | id for this component   |                                |
| **cssClasses** | list of css classes     | content of the css attribute   |
| **style**      | inline style attributes | content of the style attribute |
| **wrapped**    | the wrapped component   |                                |
| **content**    | the popover content     |                                |

You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/popover

