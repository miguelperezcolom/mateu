---
title: "Tabs layout"
weight: 100
---



An tab layout layouts panels in tabs, only one of the tab contents is visible at a time.

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
            "text": "Tab 1"
          },
          "id": "fieldId"
        }
      ],
      "metadata": {
        "type": "Tab",
        "active": false,
        "label": "Tab 1"
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
            "text": "Tab 2"
          },
          "id": "fieldId"
        }
      ],
      "metadata": {
        "type": "Tab",
        "active": false,
        "label": "Tab 2"
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
            "text": "Tab 3"
          },
          "id": "fieldId"
        }
      ],
      "metadata": {
        "type": "Tab",
        "active": false,
        "label": "Tab 3"
      }
    }
  ],
  "metadata": {
    "type": "TabLayout"
  }
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    TabLayout.builder()
              .tabs(List.of(
                      new Tab("Tab 1", new Text("Tab 1")),
                      new Tab("Tab 2", new Text("Tab 2")),
                      new Tab("Tab 3", new Text("Tab 3"))
              ))
              .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

```java

    public class FormWithTabs {
    
      @Tab("Tab 1")
      Object panel1 = new Text("Panel 1");
    
      @Tab("Tab 2")
      Object panel2 = new Text("Panel 2");

      @Tab("Tab 3")
      Object panel3 = new Text("Panel 3");

    }

```

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a accordion layout:

| Property        | Description                                           | Notes                          |
|-----------------|-------------------------------------------------------|--------------------------------|
| **id**          | id for this component                                 |                                |
| **cssClasses**  | list of css classes                                   | content of the css attribute   |
| **style**       | inline style attributes                               | content of the style attribute |
| **fullWidth**   | shortcut to set width:100%                            | true/false                     |
| **orientation** | one of horizontal, vertical                           |                                |
| **variant**     | one of centered, equalwidth, minimal, small, bordered |                                |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/tabs



