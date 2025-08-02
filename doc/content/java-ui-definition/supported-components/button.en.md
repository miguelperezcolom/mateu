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

## Variants





