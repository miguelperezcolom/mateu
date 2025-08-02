---
title: "Horizontal Layout"
weight: 100
---

An horizontal layout layouts children horizontally.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
                                "type": "ClientSide",
                                "children": [
                                    {
                                        "type": "ClientSide",
                                        "metadata": {
                                            "type": "Text",
                                            "container": "p",
                                            "text": "Panel"
                                        },
                                        "id": "fieldId",
                                        "style": "background-color: #d7f0b2;color: darkgreen;border: 1px solid darkgreen;width: 7rem;display: flex;align-items: center;justify-content: center;height: 3rem;"
                                    },
                                    {
                                        "type": "ClientSide",
                                        "metadata": {
                                            "type": "Text",
                                            "container": "p",
                                            "text": "Panel"
                                        },
                                        "id": "fieldId",
                                        "style": "background-color: #d7f0b2;color: darkgreen;border: 1px solid darkgreen;width: 7rem;display: flex;align-items: center;justify-content: center;height: 3rem;"
                                    }
                                ],
                                "metadata": {
                                    "type": "HorizontalLayout",
                                    "spacing": false,
                                    "padding": false,
                                    "margin": false,
                                    "wrap": false,
                                    "fullWidth": false
                                }
                            };

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    HorizontalLayout.builder()
        .content(List.of(
            buildPanel(),
            buildPanel()
        ))
        .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

```java

    @HorizontalLayout
    var panels = List.of(
        buildPanel(),
        buildPanel()
      );
    
```    

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for an horizontal layout:

| Property              | Description                            | Notes                                              |
|-----------------------|----------------------------------------|----------------------------------------------------|
| **id**                | id for this component                  |                                                    |
| **cssClasses**        | list of css classes                    | content of the css attribute                       |
| **style**             | inline style attributes                | content of the style attribute                     |
| **padding**           | to add some padding to the elements    | true/false                                         |
| **spacing**           | to add some spacing between elements   | true/false                                         |
| **fullWidth**         | shortcut to set width:100%             | true/false                                         |
| **justification**     | justification of elements              | one of START, CENTER, END, BETWEEN, AROUND, EVENLY |
| **flexGrows**         | list of flex grows values for elements | e.g. List.of(0,0,1,0)                              |
| **spacingVariant**    | amount of space between elements       | one of xs, x, m, l, xl                             |
| **wrap**              | wrap if content does not fit           | true/false                                         |
| **verticalAlignment** | vertical alignment for elements        | one of STRETCH, START, CENTER, END, BASELINE       |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/horizontal-layout
