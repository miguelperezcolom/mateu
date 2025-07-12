---
title: "Data exchange"
weight: 5
---

Besides UI definition metadata, in Mateu there are three kinds of **runtime related data** which travel back and forth:

- AppState
- ComponentState
- ComponentData

The following diagram explains it:

<p align="center"><img src="../../../images/arch-overall-9.svg" width="700"/></p>

## App State

The app state data contains the application state. It is stored in the browser, and it travels in the payload of 
every request to the server.

From the server side, we can send it back to the browser in case we want to update it.

This data is used, for instance, to hold the feature flags values or any customer session related info.

## Component State

The component state contains the state of any server-based component. It is stored in each component, and it travels
in the payload of every request to the server.

From the server side, we can send it back to the browser in case we want to update it.

This data is used, for instance, to hold the form input values.

## Component Data

The component data contains data which is consumed by the component, but we don't want it to be sent to the server
in the payload of every request. So, this data only travels from the server to the frontend.

This data is used, for instance, to hold the rows data in a crud.

