# Mateu

Mateu is a framework for creating awesome **responsive web applications** from **java** at speed of light, and it's main target is to allow you to do it with the **minimum lines of code**.

In essence, with Mateu

```java
@MateuUI("")
public class DemoApp {

    @MenuOption
    private BasicFieldsForm basicFields;

    @Submenu
    private FormsSubmenu forms;

    @Submenu
    private CollectionsSubmenu collections;

    @Submenu
    private RefsSubmenu refs;

    @Submenu("Some cruds")
    private CrudsSubmenu cruds;

    @Submenu("NFL")
    private NFLSubmenu nfl;

    @Submenu("Star Wars")
    private SWSubmenu sw;

}

```

becomes

![Mateu](https://raw.githubusercontent.com/wiki/miguelperezcolom/mateu/images/frontpage.png)

So, you define your whole application by using plain java clases. From the application structure and menus to any UI custom component.

It can't be easier. I hope you like it ;)


## Read the user manual

Please go to [https://github.com/miguelperezcolom/mateu-mdd/wiki]
