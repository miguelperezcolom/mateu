---
title: "Feature flags"
weight: 7
---

You can build your feature flags by leveraging the shared app state.

At runtime, you can override them using and **overrides** parameter in the url. The content of the **overrides** parameter is parsed 
and will be merged with the app state.


For instance, the url http://redhat.mateu.io/?overrides={"tenantId":"23"} will generate the following payload when 
calling the server:

```json
{
  "appState": {
      "tenantId": "23",
      ...
  },
  ...
}
```

You can place anything you want, there. E.g. your feature flags.

If you pass an invalid json as the **overrides** parameter, like http://redhat.mateu.io/?overrides=xxx, 
it's content will be sent as **config** in the **appState** objet as follows:

```json
{
  "appState": {
      "config": "xxx",
      ...
  },
  ...
}
```



