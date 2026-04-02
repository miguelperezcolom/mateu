---
title: "Cookie Consent"
weight: 100
---

Show and manage a cookie consent.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
    "type": "ClientSide",
    "metadata": {
        "type": "CookieConsent"
    },
    "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    CookieConsent
                 .builder()
                 .build()
 
```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a context menu:

| Property          | Description                                          | Notes                          |
|-------------------|------------------------------------------------------|--------------------------------|
| **position**      | one of top-let, top-right, bottom-left, bottom-right |                                |
| **cookieName**    | cookie name                                          |                                |
| **message**       | messahe to display                                   |                                |
| **theme**         | styling                                              |                                |
| **learnMore**     | learn more link text                                 |                                |
| **learnMoreLink** | learn more link destination                          |                                |
| **dismiss**       | dismiss button text                                  |                                |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/cookie-consent




