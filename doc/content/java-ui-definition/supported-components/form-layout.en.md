---
title: "Form Layout"
weight: 100
---


A form layout layouts children in columns.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
                                "type": "ClientSide",
                                "children": [
                                    {
                                        "type": "ClientSide",
                                        "children": [
                                            {
                                                "type": "ClientSide",
                                                "metadata": {
                                                    "type": "FormField",
                                                    "dataType": "string",
                                                    "stereotype": "regular",
                                                    "observed": false,
                                                    "autofocus": false,
                                                    "label": "Name",
                                                    "colspan": 0,
                                                    "rightAligned": false,
                                                    "bold": false,
                                                    "required": false
                                                }
                                            },
                                            {
                                                "type": "ClientSide",
                                                "metadata": {
                                                    "type": "FormField",
                                                    "dataType": "integer",
                                                    "stereotype": "regular",
                                                    "observed": false,
                                                    "autofocus": false,
                                                    "label": "Age",
                                                    "colspan": 0,
                                                    "rightAligned": false,
                                                    "bold": false,
                                                    "required": false
                                                }
                                            },
                                            {
                                                "type": "ClientSide",
                                                "metadata": {
                                                    "type": "FormField",
                                                    "dataType": "bool",
                                                    "stereotype": "regular",
                                                    "observed": false,
                                                    "autofocus": false,
                                                    "label": "Registered",
                                                    "colspan": 0,
                                                    "rightAligned": false,
                                                    "bold": false,
                                                    "required": false
                                                }
                                            }
                                        ],
                                        "metadata": {
                                            "type": "FormRow"
                                        }
                                    }
                                ],
                                "metadata": {
                                    "type": "FormLayout",
                                    "maxColumns": 2,
                                    "autoResponsive": true,
                                    "labelsAside": false,
                                    "expandColumns": false,
                                    "expandFields": false
                                },
                                "style": "width: 30rem;"
                            } ;

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    FormLayout.builder()
            .content(List.of(
                    FormRow.builder()
                            .content(List.of(
                                    FormField.builder()
                                            .dataType(FieldDataType.string)
                                            .label("Name")
                                            .build(),
                                    FormField.builder()
                                            .dataType(FieldDataType.integer)
                                            .label("Age")
                                            .build(),
                                    FormField.builder()
                                            .dataType(FieldDataType.bool)
                                            .label("Registered")
                                            .build()
                            ))
                            .build()
            ))
            .autoResponsive(true)
            .maxColumns(2)
            .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

```java

    @FormColumns(2)
    class MyForm {
        
        String name;
        
        int age;
        
        boolean registered;
  
    }
    
```

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a form layout:

| Property            | Description                                            | Notes                                              |
|---------------------|--------------------------------------------------------|----------------------------------------------------|
| **id**              | id for this component                                  |                                                    |
| **cssClasses**      | list of css classes                                    | content of the css attribute                       |
| **style**           | inline style attributes                                | content of the style attribute                     |
| **autoResponsive**  | to make the form responsive according to columns width | true/false                                         |
| **labelsAside**     | to place the labels at left, inside top of field       | true/false                                         |
| **fullWidth**       | shortcut to set width:100%                             | true/false                                         |
| **columnWidth**     | column width                                           | px, em, rem, ... |
| **expandColumns**   | expand columns                                         | true/false                                         |
| **expandFields**    | expand fields                                          | true/false                                         |
| **maxColumns**      | max columns in a row                                   | number                                             |
| **responsiveSteps** | fine grained responsive steps                          | look at Vaadin doc                                 |
| **columnSpacing**   | space between columns                                  | px, em, rem, ...                                   |
| **rowSpacing**      | space between rows                                     | px, em, rem, ...                                   |
| **labelSpacing**    | space between label and row                            | px, em, rem, ...                                   |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/form-layout

