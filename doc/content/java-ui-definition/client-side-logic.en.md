---
title: "Client side logic"
weight: 4
---

With Mateu you can define kind of **business rules** to drive the behavior at client side. 

<p align="center"><img src="../../../images/arch-overall-8.svg" width="500"/></p>

An ordered list of rules is deployed for every 
backend-driven component, and they have the following fields:

- Filter
- Action
- Data
- Result


So, the list of rules is evaluated every time the data changes for any backend-driven component, in the browser.

If any of the rules apply (the **filter** formField evaluation returns a truthy value) then the **action** is performed. 
Depending on the **result** field value the evaluation of the other rules will continue, or it will be aborted.

The list of available actions is:

- Show
- Hide
- Enable
- Disable 
- RunAction
- ShowAction
- HideAction
- EnableAction
- DisableAction
- RunJS
- SetAttributeValue
- AddClass
- RemoveClass
- SetStyleValue
- SetValue


The list of possible results is:

- Continue
- Stop


This way you can define te typical behaviour that you want to happen on the client side.

If this is not enough, the way to go is to build your own web component and use it in your UIs.
