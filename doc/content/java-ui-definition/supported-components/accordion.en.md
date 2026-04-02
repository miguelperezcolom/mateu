---
title: "Accordion Layout"
weight: 100
---


An accordion layout layouts panel titles vertically, only one of the panel contents is visible at a time.

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
                                                    "type": "Text",
                                                    "container": "p",
                                                    "text": "Panel 1"
                                                },
                                                "id": "fieldId"
                                            }
                                        ],
                                        "metadata": {
                                            "type": "AccordionPanel",
                                            "active": false,
                                            "disabled": false,
                                            "label": "Panel 1"
                                        }
                                    },
                                    {
                                        "type": "ClientSide",
                                        "children": [
                                            {
                                                "type": "ClientSide",
                                                "metadata": {
                                                    "type": "Text",
                                                    "container": "p",
                                                    "text": "Panel 2"
                                                },
                                                "id": "fieldId"
                                            }
                                        ],
                                        "metadata": {
                                            "type": "AccordionPanel",
                                            "active": false,
                                            "disabled": false,
                                            "label": "Panel 2"
                                        }
                                    },
                                    {
                                        "type": "ClientSide",
                                        "children": [
                                            {
                                                "type": "ClientSide",
                                                "metadata": {
                                                    "type": "Text",
                                                    "container": "p",
                                                    "text": "Panel 3"
                                                },
                                                "id": "fieldId"
                                            }
                                        ],
                                        "metadata": {
                                            "type": "AccordionPanel",
                                            "active": false,
                                            "disabled": false,
                                            "label": "Panel 3"
                                        }
                                    }
                                ],
                                "metadata": {
                                    "type": "AccordionLayout"
                                }
                            };

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    AccordionLayout
                   .builder()
                   .panels(List.of(
                          new AccordionPanel("Panel 1", new Text("Panel 1")),
                          new AccordionPanel("Panel 2", new Text("Panel 2")),
                          new AccordionPanel("Panel 3", new Text("Panel 3"))
                   ))
                   .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

```java

    @AccordionLayout
    List panels = List.of(
        new Text("Panel 1"),
        new Text("Panel 2"),
        new Text("Panel 3")
      );

```

or

```java

    @AccordionLayout
    class Container {
        
      Object panel1 = new Text("Panel 1");
      @AcoordionPanel(active=true)
      Object panel2 = new Text("Panel 2");
      Object panel3 = new Text("Panel 3");
      
    }

```

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a accordion layout:

| Property        | Description                   | Notes                          |
|-----------------|-------------------------------|--------------------------------|
| **id**          | id for this component         |                                |
| **cssClasses**  | list of css classes           | content of the css attribute   |
| **style**       | inline style attributes       | content of the style attribute |
| **fullWidth**   | shortcut to set width:100%    | true/false                     |
| **variant**     | one of filled, small, reverse |                                |

And this is the list of available properties for a accordion panel:

| Property     | Description | Notes                            |
|--------------|-------------|----------------------------------|
| **active**   | true/false  | only 1 panel is active at a time |
| **disabled** | true/false  |                                  |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/accordion


