---
title: "Split Layout"
weight: 100
---


A split layout layouts children horizontally or vertically, and shows a splitter the user can drag.

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
                                            "text": "Master"
                                        },
                                        "id": "fieldId"
                                    },
                                    {
                                        "type": "ClientSide",
                                        "metadata": {
                                            "type": "Text",
                                            "container": "p",
                                            "text": "Detail"
                                        },
                                        "id": "fieldId"
                                    }
                                ],
                                "metadata": {
                                    "type": "SplitLayout"
                                }
                            };

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    SplitLayout.builder()
        .master(new Text("Master"))
        .detail(new Text("Detail"))
        .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

```java

    @SplitLayout
    List panels = List.of(
        new Text("Master"),
        new Text("Detail")
      );

```

or

```java

    @SplitLayout
    class Container {
      Object master = new Text("Master");
      Object detail = new Text("Detail");
    }

```

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a split layout:

| Property        | Description                | Notes                          |
|-----------------|----------------------------|--------------------------------|
| **id**          | id for this component      |                                |
| **cssClasses**  | list of css classes        | content of the css attribute   |
| **style**       | inline style attributes    | content of the style attribute |
| **fullWidth**   | shortcut to set width:100% | true/false                     |
| **orientation** | horizontal/vertical        |                                |
| **variant**     | the size of the dragger    | small/minimal                  |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/split-layout

