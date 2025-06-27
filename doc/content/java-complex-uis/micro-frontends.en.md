---
title: "Micro frontends"
weight: 10
---

Client side, edge side and server side composition. Diagrams.

Mateu is tightly related to micro services and micro frontends. We can both easily embed our UIs in any existing website (no matter how it is built) and in existing UIs defined using Mateu.

## Embedding in frontend

Mateu frontend reference implementation uses web components, so you only need to add the script and use the web component in your page. Something like this:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>This is a demo</title>
    <script type="module" src="https://unpkg.com/mateu-ui/dist/assets/mateu.js"></script>
</head>
<body>
    <mateu-ui uiId="com.example.demoremote.ui.demoApp.DemoApp"
              baseUrl="https://explorer.mateu.io/mateu/v1">
    </mateu-ui>
</body>
</html>
```

That would embed the whole UI (including menus) in any website. If you want to embed only a form or crud you can do it with the following snippet:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>This is a demo</title>
    <script type="module" src="https://unpkg.com/mateu-ui/dist/assets/mateu.js"></script>
</head>
<body>
    <journey-starter uiId="com.example.demoremote.ui.demoApp.DemoApp"
                     journeytypeid="forms_returnsResult"
                     baseurl="https://explorer.mateu.io/mateu/v1">
        
    </journey-starter>
</body>
</html>
``` 

In the end they are just web components, so you can place them wherever you want.

### Passing parameters from the frontend

When embedding a Mateu UI web component you can pass additional parameters to the backend by using the `contextdata` attribute. Please notice it expects a valid json there:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>This is a demo</title>
    <script type="module" src="https://unpkg.com/mateu-ui/dist/assets/mateu.js"></script>
</head>
<body>
    
    <journey-starter uiId="com.example.demoremote.ui.demoApp.DemoApp"
                     journeytypeid="forms_returnsResult"
                     baseurl="https://explorer.mateu.io/mateu/v1"
                     contextdata='{"tenantId": "1111","profile": "dev"}'
    >        
    </journey-starter>

</body>
</html>
``` 

You can later consume that context data from your java classes by implementing the `ConsumesContextData` interface, as follows:

```java
public class Home implements ConsumesContextData {

  @Override
  public void consume(Map<String, Object> context, ServerHttpRequest serverHttpRequest) {
    // do whatever you want with the context data
  }

}

```

### The design system as the glue

Mateu relies (as per today) in Vaadin's design system to provide a homogeneous user experience.

## Defining composition from the backend

Sometimes you want to add a component which has been defined in another micro service. This meaning you do not have access to the java class which defines that UI fragment.

For those cases you can use the `MicroFrontend` component. E.g.:

```java
  MicroFrontend remote = new MicroFrontend(
          "https://article2.mateu.io/booking/booking_bookings",
          Map.of()
  );
```

You can use that as any other component, so your UI can contain fragments from different micro services.
