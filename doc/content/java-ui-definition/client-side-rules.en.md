---
title: "Client-side Rules"
weight: 4
---

With Mateu you can define business **rules** to drive the behavior at client side. A list of rules is deployed for every 
backend-driven component, and they have the following fields:

- Filter
- Action
- Data
- Result

So, the list of rules is evaluated every time the data changes for any backend-driven component, in the browser.

If any of the rules apply (the **filter** field evaluation returns a truthy value) then the **action** is performed. Depending on the 
field **result** the evaluation of teh other rules will continue, or it will be aborted.

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

The list of possible results is:

- Continue
- Stop
