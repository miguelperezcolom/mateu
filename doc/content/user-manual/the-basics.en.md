---
title: "The basics"
weight: 1
---

We could reduce any user interface to two basic operations: showing information to the user, and allowing the user to interact with our system by providing data and triggering actions. On top of those operations there is a flow which happens, as the user interface changes according to the previous user actions and the context. With Mateu we can describe those operations and the flow using plain java.

So, we start by linking a url to a java class. That enables the first interaction, which is the user entering that url in the browser and, as the consequence, some information and elements are displayed to the user. The information and elements which are displayed to the user are inferred from the java class.

From that point, what happens is up to us. If we place in that class a java method and annotate it with `@MainAction` or `@Action` (or a `Callable` field annotated with `@Button`) a button will be displayed to the user so he/she can call that method. When the user clicks that button the java method will be called in the server side and the browser will be updated according to the result of that method call. If we want to collect some data from the user we just need to add fields to our java class, so the appropriate fields are displayed to the user and the information entered by him/her will be used to hydrate the java object in the server side, before calling any method. We can even just declare some parameters to our java method to collect data from the user, so a form would be displayed to the user for gathering that data before actually calling the java method on the server side.

We can adjust what is displayed to the user by using annotations and implementing java interfaces, in our classes, but that's essentially it.
