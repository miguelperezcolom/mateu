---
title: "Extension points"
weight: 12
---

You can easily extend Mateu to fit your needs.

On the **server side** you can:

- Provide your own beans to overwrite the default logic of Mateu. Specifically, you can provide your own beans for the following interfaces:
  - InstanceFactory
  - ActionRunner
  - UIIncrementMapper
- Provide your own Mateu API server, for supporting a new language or for providing a different implementation than the ones Mateu provides.

On the **client side** you can:

- Provide your own css files
- Provide your own web components, which can be then used in your UI s any other Mateu component
- Provide your own frontend, perhaps using your own design system or just because you want to do it
