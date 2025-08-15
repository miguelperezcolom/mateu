---
title: "Details"
weight: 100
---


Collapsible content with a summary.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: 20rem;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "Details",
    "summary": {
      "type": "ClientSide",
      "metadata": {
        "type": "Text",
        "container": "div",
        "text": "Invoices"
      },
      "id": "fieldId"
    },
    "content": {
      "type": "ClientSide",
      "children": [
        {
          "type": "ClientSide",
          "metadata": {
            "type": "Text",
            "container": "div",
            "text": "There are 1000 pending invoices."
          },
          "id": "fieldId"
        },
        {
          "type": "ClientSide",
          "metadata": {
            "type": "Text",
            "container": "div",
            "text": "For a total of 34.213,01 Euros"
          },
          "id": "fieldId"
        },
        {
          "type": "ClientSide",
          "metadata": {
            "type": "Anchor",
            "text": "Go wherever"
          },
          "id": "fieldId"
        }
      ],
      "metadata": {
        "type": "VerticalLayout",
        "spacing": true,
        "padding": false,
        "margin": false,
        "wrap": false,
        "fullWidth": false
      }
    },
    "opened": false
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

 Details.builder()
        .summary(new Text("Invoices"))
        .content(VerticalLayout.builder()
                .content(List.of(
                        new Text("There are 1000 pending invoices."),
                        new Text("For a total of 34.213,01 Euros"),
                        new Anchor("Go wherever", "")
                ))
                .spacing(true)
                .build())
        .opened(false)
        .build()
 
```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a details component:

| Property       | Description                             | Notes                          |
|----------------|-----------------------------------------|--------------------------------|
| **id**         | id for this component                   |                                |
| **cssClasses** | list of css classes                     | content of the css attribute   |
| **style**      | inline style attributes                 | content of the style attribute |
| **summary**    | the content in the summary/header       |                                |
| **content**    | the wrapped content                     |                                |
| **opened**     | if it must be opened from the beginning |                                |



You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/details





