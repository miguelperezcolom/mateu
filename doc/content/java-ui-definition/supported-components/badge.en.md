---
title: "Badge"
weight: 100
---


A badge to highlight some short info.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
        "type": "ClientSide",
        "metadata": {
          "type": "Badge",
          "text": "Hola",
          "color": "success",
          "primary": true,
          "small": false,
          "pill": true
        },
        "id": "fieldId"
      };

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

            Badge.builder()
                  .text("Hola")
                  .pill(true)
                  .primary(true)
                  .color(BadgeColor.success)
                  .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

There is no declarative thing for badges. Just use a Badge record as in imperative. 

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a badge:

| Property       | Description                                      | Notes                          |
|----------------|--------------------------------------------------|--------------------------------|
| **id**         | id for this component                            |                                |
| **cssClasses** | list of css classes                              | content of the css attribute   |
| **style**      | inline style attributes                          | content of the style attribute |
| **pill**       | rounded borders                                  | true/false                     |
| **color**      | one of normal, success, error, contrast, primary |                                |
| **small**      | true/false                                       |                                |



You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/badge

