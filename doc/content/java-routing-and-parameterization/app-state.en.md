---
title: "Shared app state"
weight: 6
---

As said in the Mateu home page, Mateu backend is stateless. However, a general app state is maintained in the browser, 
for each UI.

That app state travels to the backend for each request, so components can use it to share data and to keep a kind of 
session store.

E.g. this is the payload for a sample http request to the server, from Mateu:

```json
{
  "appState": {
    "config": {
      "tenantId": "1111",
      "profile": "dev"
    }
  },
  "initiatorComponentId":"tZWK0sW3HMUEAuXBBvy-D",
  "consumedRoute":"/fluent-app"
}
```

From the server side, you can update the app shared state by returning a **UIIncrement** object which includes the new 
app state, or by returning an AppState object as in the example below:

```java

public class Home {

  @Action(background = true)
  Callable action2 = () -> new AppState(newAppState);

}


```

From that moment, the new app state will travel in each http request to the server, and will be readable by any server
side object managing an action. E.g. like in the example below:

```java

  @Override
  public Mono<Object> handleAction(String actionId, HttpRequest httpRequest) {
  
    MyAppState appState = httpRequest.getAppState(MyAppState.class);

    var newAppState = appState.withSomeField("xxxx");

    return Mono.just(new AppState(newAppState));
  
}

```

## Initial values

How to set the initial value for the app state is up to you, e.g. by using application.properties or application.yaml 
file in springboot in the server side. E.g.:

```properties

mateu.app-state.key1= "value1"
mateu.app-state.key2= "value2"

```

You can also overwrite the default app state initial value supplier by providing your own bean, implementing the 
**AppStateProvider** interface.  

You can also set it when embedding a mateu-ui or mateu-ux component in your html,
using the xxxx attribute like below:

```html
tbd
```


