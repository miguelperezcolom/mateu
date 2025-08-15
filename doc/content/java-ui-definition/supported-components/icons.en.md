---
title: "Icons"
weight: 100
---

An icon.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "Icon",
    "icon": "vaadin:form"
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    new Icon(IconKey.Form)


```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for an icon:

| Property       | Description             | Notes                          |
|----------------|-------------------------|--------------------------------|
| **id**         | id for this component   |                                |
| **cssClasses** | list of css classes     | content of the css attribute   |
| **style**      | inline style attributes | content of the style attribute |
| **icon**       | one of IconKey enum     |                                |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/icon

