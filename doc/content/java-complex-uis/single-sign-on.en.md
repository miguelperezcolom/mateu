---
title: "SSO"
weight: 40
---

Aggregate apps using single-sign-on (SSO).

Some times you create several apps which are glued together using a single sign on (SSO) mechanism.

Please notice that using Mateu the user token is stored in the browser in the session storage and, when you open another Mateu frontend, that value is sent in each rest https request to the api.

In case you have several Mateu apps you can just make your UI class implement the `HasApps` interface as follows:

```java
public class DemoApp implements HasLogin, HasAppTitle, HasApps
{

    // ...

    @Override
    public List<App> getApps() {
        return List.of(
                new App("vaadin:invoice", "Invoicing", "", "", false),
                new App("vaadin:calendar-user", "HR", "", "", false),
                new App("vaadin:factory", "Factory", "", "", true),
                new App("vaadin:doctor", "Health", "", "/simpleform", false)
        );
    }    
}
```

