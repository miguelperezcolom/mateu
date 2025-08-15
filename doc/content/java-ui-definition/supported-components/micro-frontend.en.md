---
title: "Micro frontend"
weight: 100
---



A Mateu micro frontend. Due to the design of Mateu, everything is consumable as a micro frontend in any Mateu UI.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
        "type": "ClientSide",
        "metadata": {
          "type": "Badge",
          "text": "Hola",
          "color": "success",
          "primary": true,
          "small": false,
          "pill": true
        },
        "id": "fieldId"
      };

    //document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

   MicroFrontend.builder()
                .baseUrl("/fluent")
                .route("/fluent-app/components/card")
                .consumedRoute("/fluent-app")
                .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

There is no declarative thing for badges. Just use a Micro frontend record as in imperative.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a micro frontend component:

| Property           | Description                                                 | Notes                          |
|--------------------|-------------------------------------------------------------|--------------------------------|
| **id**             | id for this component                                       |                                |
| **cssClasses**     | list of css classes                                         | content of the css attribute   |
| **style**          | inline style attributes                                     | content of the style attribute |
| **baseUrl**        | base url                                                    | true/false                     |
| **route**          | micro frontend's route                                      |                                |
| **consumedRoute**  | useful in case the micro frontend route is par of an app    |                                |



