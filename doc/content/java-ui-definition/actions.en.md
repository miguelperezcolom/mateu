---
title: "Actions"
weight: 30
---

With Mateu the UI you define is rendered in the browser, and you can link the user interactions (e.g. clicking a button, 
hovering something, writing some text in an input formField, ...) to calls to the server. Usually you do that transparently
by providing a callback or a lambda when you create the component, but you can also explicitly define an **action** in 
order to override the default behavior.

You can also define triggers to trigger an action upon some events.   

# Actions

As said, you will define **actions** to override the default behavior (e.g. to perform client side validations or show a confirm dialog before calling the backend).

You will also define **actions** when you want to state that an action happens in the background (no loader is showed 
while making the call).

## Explicitly defining actions

You can explicitly define actions by implementing the **HasActions** interface. 


{{< tabs "tab-group-name" >}}

{{< tab "Declarative" >}}

```java
@Action(id = "action1", requiresConfirmation = true)
public class Home {

  @Action(background = true)
  Runnable action2 = () -> "Hola!";

}
```

or

```java
@Action(id = "action1", requiresConfirmation = true)
@Action(id = "action2", background = true)
public class Home {

  void action2() {
    return "Hola!";
  }

}
```


{{< /tab >}}


{{< tab "Fluent" >}}

```java

@Slf4j
public class Home implements HasActions, HandlesActions {

    @Override
    public List<Action> getActions(HttpRequest httpRequest) {
        return List.of(
          
          Action.builder()
            .id("action1")
            .requiresConfirmation(true)
            .build(),
          
          Action.builder()
            .id("action2")
            .background(true)
            .build()

        );
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
      log.info("You have called {}", actionId);
      return new State(this);
    }

}
```

{{< /tab >}}

{{< /tabs >}}

## Explicitly handling actions

As said, you usually create actions transparently when providing callbacks or lambdas, but you can also provide an
action manager for your component. You just need to implement the **HandlesActions** interface, like below:

```java
public class Home implements HandlesActions {

    @Override
    public boolean supportsAction(String actionId) {
        return true;
    }

    @Override
    public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
        return Mono.just(this);
    }

}
```

The **HandlesActions** interface has a reactive counterpart, which is the **HandlesActionsReactive** interface.

## Client side actions

You have a **href** and **js** properties for any action in case you want to just redirect the user to wherever 
or run some javascript on the browser (e.g. to update the state or the data stores) without a server round-trip.

## Response 

Depending on the object returned, Mateu will infer what you want to happen in the client side:

- If you return an object implementing the **ComponentSupplier** or the **Component** interfaces, new content will be rendered in the browser
- If you return any object, it will be converted to its String value and that value will be rendered in the browser
- You can return a **UIIncrement** object if you want, including:
  - UI components
  - Data
  - State
  - Commands
- You can also return State and Data records if you only want to update the state or data stores in the frontend.

# Triggers

Triggers can also be defined for actions. E.g.:

- OnLoad
- OnSuccess
- On data change

# Caching

Caching can also be defined for actions.
