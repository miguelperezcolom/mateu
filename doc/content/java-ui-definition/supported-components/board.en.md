---
title: "Board Layout"
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
      "children": [
        {
          "type": "ClientSide",
          "metadata": {
            "type": "Text",
            "container": "p",
            "text": "Panel"
          },
          "id": "fieldId",
          "style": "background-color: #d7f0b2;color: darkgreen;border: 1px solid darkgreen;display: flex;align-items: center;justify-content: center;height: 3rem;margin-block-start: 0;margin-block-end: 0;"
        },
        {
          "type": "ClientSide",
          "metadata": {
            "type": "Text",
            "container": "p",
            "text": "Panel"
          },
          "id": "fieldId",
          "style": "background-color: #d7f0b2;color: darkgreen;border: 1px solid darkgreen;display: flex;align-items: center;justify-content: center;height: 3rem;margin-block-start: 0;margin-block-end: 0;"
        },
        {
          "type": "ClientSide",
          "metadata": {
            "type": "Text",
            "container": "p",
            "text": "Panel"
          },
          "id": "fieldId",
          "style": "background-color: #d7f0b2;color: darkgreen;border: 1px solid darkgreen;display: flex;align-items: center;justify-content: center;height: 3rem;margin-block-start: 0;margin-block-end: 0;"
        }
      ],
      "metadata": {
        "type": "BoardLayoutRow"
      }
    },
    {
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
                "text": "Panel"
              },
              "id": "fieldId",
              "style": "background-color: #d7f0b2;color: darkgreen;border: 1px solid darkgreen;display: flex;align-items: center;justify-content: center;height: 3rem;margin-block-start: 0;margin-block-end: 0;"
            }
          ],
          "metadata": {
            "type": "BoardLayoutItem",
            "boardCols": 1
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
                "text": "Panel"
              },
              "id": "fieldId",
              "style": "background-color: #d7f0b2;color: darkgreen;border: 1px solid darkgreen;display: flex;align-items: center;justify-content: center;height: 3rem;margin-block-start: 0;margin-block-end: 0;"
            }
          ],
          "metadata": {
            "type": "BoardLayoutItem",
            "boardCols": 2
          }
        }
      ],
      "metadata": {
        "type": "BoardLayoutRow"
      }
    }
  ],
  "metadata": {
    "type": "BoardLayout"
  },
  "style": "width: 50rem;"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java



                    BoardLayout.builder()
                                .rows(List.of(
                                        BoardLayoutRow.builder()
                                                .content(List.of(
                                                        buildPanel(),
                                                        buildPanel(),
                                                        buildPanel()
                                                ))
                                                .build(),
                                        BoardLayoutRow.builder()
                                                .content(List.of(
                                                                new BoardLayoutItem(buildPanel(), 1),
                                                        new BoardLayoutItem(buildPanel(), 2)
                                                ))
                                                .build()
                                    ))
                                .build("width: 40rem;")

```

{{< /tab >}}

{{< tab "Declarative" >}}

```java

    @BoardLayout
    List panels = List.of(
        List.of(
          buildPanel(),
          buildPanel(),
          buildPanel()
        ),
        List.of(
          buildPanel(),
          new BoardItem(buildPanel(), 2)
        )
      );

```

or

```java

    @BoardLayout
    class Container {
      Object row1 = List.of(
        buildPanel(),
        buildPanel(),
        buildPanel()
      );
      Object row2 = List.of(
        buildPanel(),
        new BoardItem(buildPanel(), 2)
      );
    }

```

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a board layout:

| Property        | Description                | Notes                          |
|-----------------|----------------------------|--------------------------------|
| **id**          | id for this component      |                                |
| **cssClasses**  | list of css classes        | content of the css attribute   |
| **style**       | inline style attributes    | content of the style attribute |
| **fullWidth**   | shortcut to set width:100% | true/false                     |

This is the list of available properties for a board layout item:

| Property       | Description             | Notes   |
|----------------|-------------------------|---------|
| **boardCols**  | colspan                 | number  |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/board



