---
title: "Actions"
weight: 5
---

With Mateu the UI you define is rendered in the browser, and you can link the user interactions (e.g. clicking a button, 
hovering something, writing some text in an input field, ...) to calls to the server. Usually you do that transparently
by providing a callback or a lambda when you create the component, but you can also explicitly define an **action** in 
order to override the default behavior (e.g. to perform client side validations or show a confirm dialog before calling the backend).  

You will also define **actions** when you want to state that an action happens in the background (no loader is showed 
while making the call).

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

Depending on the object returned, Mateu will infer what you want to happen in the client side:

- If you return an object implementing the **ComponentSupplier** or the **Component** interfaces, new content will be rendered in the browser
- If you return any object, it will be converted to its String value and that value will be rendered in the browser
- You can return a **UIIncrement** object if you want, including:
  - UI components
  - Data
  - Commands

Triggers can also be defined for actions. E.g.:

- OnLoad
- OnSuccess
- On data change

Caching can also be defined for actions.
