---
title: "Button"
weight: 100
---

## Introduction

Well, you know what a button is.:

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  var component = {
                                  "type": "ClientSide",
                                  "metadata": {
                                      "type": "Button",
                                      "label": "Do something"
                                  },
                                  "id": "fieldId"
                              };
  
  document.getElementById('componente').component = component;

</script>


The way to declare it is as follows:


{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

Button.builder()
    .label("Do something")
    .build()


```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD

{{< /tab >}}

{{< /tabs >}}

## Available properties

This is the list of available properties for a button:

| Property        | Description                                  | Notes                          |
|-----------------|----------------------------------------------|--------------------------------|
| **id**          | id for this component                        |                                |
| **cssClasses**  | list of css classes                          | content of the css attribute   |
| **style**       | inline style attributes                      | content of the style attribute |
| **label**       | button label                                 |                                |
| **iconOnLeft**  | icon key                                     |                                |
| **iconOnRight** | icon key                                     |                                |
| **image**       | image url                                    |                                |
| **color**       | one of success, error, contrast, normal      |                                |
| **primary**     | true/false                                   |                                |
| **autofocus**   | true/false                                   |                                |
| **disabled**    | true/false                                   |                                |
| **actionId**    | action id                                    |                                |
| **actionable**  | combination of id, label, action id and path |                                |
| **runnable**    | a java runnable                              |                                |
| **callable**    | a java callable                              |                                |

You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/button
