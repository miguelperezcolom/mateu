---
title: "Progress Bar"
weight: 100
---



A progress bar.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: 10rem;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "ProgressBar"
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

  ProgressBar.builder().build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

There is no declarative thing for progress bars. Just use a progress bar record as in imperative.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a popover component:

| Property       | Description             | Notes                          |
|----------------|-------------------------|--------------------------------|
| **id**         | id for this component   |                                |
| **cssClasses** | list of css classes     | content of the css attribute   |
| **style**      | inline style attributes | content of the style attribute |

You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/progress-bar


