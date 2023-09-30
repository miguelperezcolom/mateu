## Springboot security

This module contains the implementation of a interface which allow us to red the user principal and roles
so we can properly evaluate annotations like `@Private` and `@Readonly`.

Those annotations are used to hide or show menu options and fields according to the user and its roles.

This dependency is optional, so you need to explicitly add it if you want to use it.