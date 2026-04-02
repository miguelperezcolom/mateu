---
title: "Breadcrumbs"
weight: 100
---



Breadcrumbs to highlight where the user is at.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "Breadcrumbs",
    "currentItemText": "Current item",
    "breadcrumbs": [
      {
        "text": "Breadcrumb 1"
      },
      {
        "text": "Breadcrumb 2"
      }
    ]
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    Breadcrumbs.builder()
                .breadcrumbs(List.of(
                        new Breadcrumb("Breadcrumb 1", ""),
                        new Breadcrumb("Breadcrumb 2", "")
                ))
                .currentItemText("Current item")
                .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

There is no declarative thing for breadcrumbs. Just use a Breadcrumbs record as in imperative.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a breadcrumbs component:

| Property            | Description             | Notes                          |
|---------------------|-------------------------|--------------------------------|
| **id**              | id for this component   |                                |
| **cssClasses**      | list of css classes     | content of the css attribute   |
| **style**           | inline style attributes | content of the style attribute |
| **currentItemText** | the last breadcrumb     | text only. no link             |
| **breadcrumbs**     | list of breadcrumbs     |                                |

This is the list of available properties for a breadcrumb:

| Property | Description              | Notes |
|----------|--------------------------|-------|
| **text** | text for this breadcrumb |       |
| **link** | url                      |       |

