---
title: "Execution model"
---

# Execution model

Mateu follows a fully stateless execution model.

## Lifecycle per request

For each request:

1. determine the viewmodel type  
2. instantiate the viewmodel  
3. hydrate it with request data  
4. execute the action  
5. serialize the result  
6. return the response  

The viewmodel is discarded after the response.

## No server-side state

There is no persistent UI state between requests.

Every interaction is independent and reproducible.

## What this enables

- horizontal scalability without constraints  
- no session management or replication  
- resilience to restarts and failures  
- consistent behavior across environments  

## Mental model

Think of Mateu as:

> UI = pure function (state → result)

No hidden lifecycle. No long-lived server objects.
