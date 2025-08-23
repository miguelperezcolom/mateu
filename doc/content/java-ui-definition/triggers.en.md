---
title: "Triggers"
weight: 40
---

Triggers can also be defined for actions. E.g.:

- OnLoad
- OnSuccess
- OnError
- OnValueChange
- OnCustomEvent

## OnLoad

Triggers an action when a component is loaded.

It supports the following parameters:

| Property      | Description                                                                                                                       | Notes        |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------|--------------|
| **actionId**  | the action to run                                                                                                                 |              |
| **times**     | how many times to repeat call the action                                                                                          |              |
| **timeout**   | delay between calls                                                                                                               | milliseconds |
| **condition** | condition which enables the trigger. The action will be called only if the result of the evaluation of teh condition returns true | javascript   |


## OnSuccess

Triggers an action when a call to the server succeeds.

It supports the following parameters:

| Property           | Description                                                                                                                       | Notes      |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------|------------|
| **actionId**       | the action to run                                                                                                                 |            |
| **calledActionId** | the action which succeeded                                                                                                        |            |
| **condition**      | condition which enables the trigger. The action will be called only if the result of the evaluation of teh condition returns true | javascript |

## OnError

Triggers an action when a call to the server fails.

It supports the following parameters:

| Property           | Description                                                                                                                        | Notes       |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------|-------------|
| **actionId**       | the action to run                                                                                                                  |             |
| **calledActionId** | the action which failed                                                                                                            |             |
| **condition**      | condition which enables the trigger. The action will be called only if the result of the evaluation of teh condition returns true  |  javascript |

## OnValueChange

Triggers an action when the user updates a value in a form.

It supports the following parameters:

| Property         | Description                                                                                                                       | Notes        |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------|--------------|
| **actionId**     | the action to run                                                                                                                 |              |
| **propertyName** | the property name of the value changed                                                                                            |              |
| **condition**    | condition which enables the trigger. The action will be called only if the result of the evaluation of teh condition returns true | javascript   |
