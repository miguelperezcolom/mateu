# Welcome page

Extend `Welcome` (io.mateu.core.infra.declarative.orchestrators.welcome) for a friendly flow
entry point: hero + CTAs + highlight tiles.

- **`Button` fields** → call-to-action buttons inside the hero. `actionId` runs the matching
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
