---
title: "The basics"
weight: 1
---

We can break down any user interface into two fundamental operations: **displaying information to the user** and **enabling user interaction through data input and action triggers**. These operations are orchestrated by a **flow**, which evolves based on user actions and the current context.

With **Mateu**, this entire behavior can be described using plain Java.

## How It Works

We begin by linking a URL to a Java class. This sets up the initial interaction—when a user navigates to that URL, Mateu renders information and UI elements based on the contents of the Java class.

From there, the behavior is entirely under your control. You can choose to define it using a declarative or imperative approach. 

### The declarative way

In case you choose to define your UI the **declarative** way:

- Add a Java method (or a **Callable** formField) and annotate it with **@Action** to expose it as a **button** in the UI.  
  When the user clicks the button, the method executes on the server, and the UI updates based on its result.
- To **collect input from the user**, simply add fields to your Java class. Mateu will automatically generate the appropriate UI controls, and user-entered values will populate the corresponding server-side fields before any method is called.
- Alternatively, you can define method parameters to gather user input. Mateu will generate a **form** to collect that data before invoking the method on the server.

You can fine-tune what’s displayed using annotations and Java interfaces—but this is the core idea: define your UI’s structure, behavior, and flow directly from your backend code, with minimal overhead and maximum clarity.

### The imperative way

In case you choose to define your UI the **imperative** way, Mateu provides a handful set of **fluent-styled** records and interfaces, so you:

- Make your java class implement the **ActionHandler** interface.
- Implement the **ComponentSupplier** interface for defining the UI, including form fields, buttons, layouts, ....

