# Welcome page

Extend `Welcome` (`io.mateu.core.infra.declarative.orchestrators.welcome`, mateu-core) for a
friendly flow entry point: hero + CTAs + highlight tiles. (Page inference also composes a
Welcome from a plain `@UI` class whose fields are only `Button`s and `@Panel` components.)

- **`Button` fields** (the `io.mateu.uidl.data.Button` record — import it by name) → call-to-action
  buttons inside the hero. `actionId` runs the matching
  `@Action` method (return `URI.create("/route")` to navigate into the flow).
- **Component fields with `@Panel(title)`** → highlight tiles on a responsive grid below.
- Override `heroTitle()` / `heroSubtitle()` / `heroImage()`.

```java
@UI("/welcome")
public class WelcomeDemo extends Welcome {

    Button start = Button.builder().label("Start check-in")
            .actionId("startCheckin").buttonStyle(ButtonStyle.primary).build();

    @Panel(title = "1 · Search the booking")
    Markdown step1 = new Markdown("Find the reservation by locator…", null, null);

    @Override protected String heroTitle() { return "Front desk check-in"; }

    @Action Object startCheckin() { return URI.create("/checkin"); }
}
```

For occasional/first-time users at the entry of a flow. Power users → `Dashboard` or the
operational screen directly.
