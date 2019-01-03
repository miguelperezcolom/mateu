[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/vaadin-flow/Lobby#?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# Beverage Buddy App Starter for Vaadin Flow
:coffee::tea::sake::baby_bottle::beer::cocktail::tropical_drink::wine_glass:

This is a Vaadin platform Java example application, used to demonstrate features of the Vaadin Flow framework.

The easiest way of using it is via [https://vaadin.com/start](https://vaadin.com/start/v10-simple-ui) - you can choose the package naming you want.

The Starter demonstrates the core Vaadin Flow concepts:
* Building UIs in Java with Components based on [Vaadin components](https://vaadin.com/components/browse), such as `TextField`, `Button`, `ComboBox`, `DatePicker`, `VerticalLayout` and `Grid` (see `CategoriesList`)
* [Creating forms with `Binder`](https://github.com/vaadin/free-starter-flow/blob/master/documentation/using-binder-in-review-editor-dialog.asciidoc) (`ReviewEditorDialog`)
* Making reusable Components on server side with `Composite` (`AbstractEditorDialog`)
* [Creating a Component based on a HTML Template](https://github.com/vaadin/free-starter-flow/blob/master/documentation/polymer-template-based-view.asciidoc) (`ReviewsList`) 
  * This template can be opened and edited with [the Vaadin Designer](https://vaadin.com/designer)
* [Creating Navigation with the Router API](https://github.com/vaadin/free-starter-flow/blob/master/documentation/using-annotation-based-router-api.asciidoc) (`MainLayout`, `ReviewsList`, `CategoriesList`)

## Prerequisites

The project can be imported into the IDE of your choice, with Java 8 installed, as a Maven project.

## Running the Project

1. Run using `mvn jetty:run`
2. Wait for the application to start
3. Open http://localhost:8080/ to view the application

## Documentation

Brief introduction to the application parts can be found from the `documentation` folder. For Vaadin documentation for Java users, see [Vaadin.com/docs](https://vaadin.com/docs/v10/flow/Overview.html).

### Branching information
* `master` the latest version of the starter, using the latest platform snapshot
* `V10` the version for Vaadin 10
* `V11` the version for Vaadin 11
* `V12` the version for Vaadin 12
