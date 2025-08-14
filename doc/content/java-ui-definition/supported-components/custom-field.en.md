---
title: "Custom Field"
weight: 100
---


Wrap whatever content with a unique field label.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "CustomField",
    "label": "Custom field",
    "content": {
      "type": "ClientSide",
      "children": [
        {
          "type": "ClientSide",
          "metadata": {
            "type": "FormField",
            "fieldId": "name",
            "dataType": "string",
            "stereotype": "regular",
            "observed": false,
            "autofocus": false,
            "colspan": 0,
            "rightAligned": false,
            "bold": false,
            "required": false
          },
          "id": "name"
        },
        {
          "type": "ClientSide",
          "metadata": {
            "type": "FormField",
            "fieldId": "birthDate",
            "dataType": "date",
            "stereotype": "regular",
            "observed": false,
            "autofocus": false,
            "colspan": 0,
            "rightAligned": false,
            "bold": false,
            "required": false
          },
          "id": "birthDate"
        }
      ],
      "metadata": {
        "type": "HorizontalLayout",
        "spacing": true,
        "padding": false,
        "margin": false,
        "wrap": false,
        "fullWidth": false
      }
    }
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    CustomField.builder()
                .label("Custom field")
                .content(HorizontalLayout.builder().content(List.of(
                        FormField.builder()
                                .id("name")
                                .dataType(FieldDataType.string)
                                .build(),
                        FormField.builder()
                                .id("birthDate")
                                .dataType(FieldDataType.date)
                                .build()
                )).spacing(true)
                        .build())
                .build()
 
```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a context menu:

| Property       | Description             | Notes                          |
|----------------|-------------------------|--------------------------------|
| **id**         | id for this component   |                                |
| **cssClasses** | list of css classes     | content of the css attribute   |
| **style**      | inline style attributes | content of the style attribute |
| **label**      | the label               |                                |
| **content**    | the wrapped content     |                                |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/custom-field



