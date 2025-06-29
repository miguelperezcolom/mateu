---
title: "Parameters"
weight: 5
---

Parameters can be defined the usual way, using query parameters, in the route. Those parameters can be later accessed 
by the server side class by implementing the **HasInitMethod** interface, like in the example below:

```java

@Route("/home")
public class Home implements HasInitMethod {

    String id;

    @Override
    public void init(HttpRequest httpRequest) {
        this.id = httpRequest.getParameterValue("id");
    }
    
}

```

The **init** method is called after instantiating and hydrating the java object, for every request. 
