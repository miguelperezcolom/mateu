---
title: "Parameters"
weight: 5
---

Parameters can be defined the usual way, using query parameters, in the route. Those parameters can be later accessed 
by the server side class by implementing the **HasPostHydrationMethod** interface, like in the example below:

```java

@Route("/home")
public class Home implements HasPostHydrationMethod {

    String id;

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        this.id = httpRequest.getParameterValue("id");
    }
    
}

```

So you can pass an **id** parameter in the url, like this: **http://localhgost:8080/myui/home?id=23**


When implementing the **HasPostHydrationMethod** interface, the **onHydrated** method is called after instantiating and 
hydrating the java object, for every request. 
