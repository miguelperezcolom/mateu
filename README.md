# Mateu MDD

Mateu MDD is a framework for creating awesome **responsive web applications** from **java** at speed of light, and it's main target is to allow you to do it with the **minimum lines of code**.

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

![MDD](https://github.com/miguelperezcolom/mateu-mdd/blob/master/doc/images/frontpage?raw=true)

So, you define your whole application by using plain java clases. From the application structure and menus to any UI custom component.

Just plain old KISS (keep it simple, stupid).

I hope you like it ;)


## Read the user manual


Please go to [https://github.com/miguelperezcolom/mateu-mdd/wiki]

