---
title: "Testing"
---

Mateu ViewModels are plain Java objects.

This makes them naturally easy to test: no framework setup, no mocks of UI infrastructure, no browser required.

---

## Unit testing actions

Test a ViewModel action by instantiating the class, calling the method, and asserting on the result.

```java
@Test
void greet_returns_message_with_name() {
    var home = new Home();
    home.name = "Alice";
    var result = home.greet();
    assertThat(result).isInstanceOf(Message.class);
    assertThat(((Message) result).text()).isEqualTo("Hello Alice");
}
```

Because actions are regular Java methods, you can test them without any Mateu-specific test infrastructure.

---

## Testing state mutations

When an action mutates ViewModel fields and returns `State(this)`, test both the return value and the field values:

```java
@Test
void save_updates_user_and_returns_message_and_state() {
    var repo = new InMemoryUserRepository();
    var page = new UserEditorPage(repo);
    page.id = "42";
    page.name = "Bob";
    page.email = "bob@example.com";
    page.roles = List.of("1");

    var result = page.save();

    assertThat(result).isInstanceOf(List.class);
    var effects = (List<?>) result;
    assertThat(effects).hasSize(2);
    assertThat(effects.get(0)).isInstanceOf(Message.class);
    assertThat(effects.get(1)).isInstanceOf(State.class);

    var saved = repo.findById("42");
    assertThat(saved).isPresent();
    assertThat(saved.get().name()).isEqualTo("Bob");
}
```

---

## Testing with injected dependencies

When the ViewModel is a Spring bean with injected dependencies, pass them directly via the constructor in the test:

```java
@Test
void usersPage_lists_all_users() {
    var repo = new UserRepository();         // plain class, no Spring needed
    var adapter = new UserAdapter(repo);
    var page = new UsersPage(adapter);

    var result = page.simpleAdapter().repository().findAll();
    assertThat(result).isNotEmpty();
}
```

Prefer constructor injection in production code specifically because it makes tests like this straightforward.

---

## Testing CRUD repositories

Test the repository in isolation:

```java
@Test
void save_and_find_by_id() {
    var repo = new UserRepository();
    var user = new User("1", "Alice", "alice@example.com", List.of("1"));

    repo.save(user);
    var found = repo.findById("1");

    assertThat(found).isPresent();
    assertThat(found.get().name()).isEqualTo("Alice");
}

@Test
void delete_removes_entity() {
    var repo = new UserRepository();
    repo.save(new User("1", "Alice", "alice@example.com", List.of()));

    repo.deleteAllById(List.of("1"));

    assertThat(repo.findById("1")).isEmpty();
}
```

---

## Integration tests with Spring Boot

For full context tests, use `@SpringBootTest`:

```java
@SpringBootTest
class DemoAdminPanelApplicationTests {

    @Test
    void contextLoads() {
        // verifies the Spring context starts without errors
    }
}
```

This catches wiring errors (missing beans, circular dependencies, misconfigured properties) without requiring a browser.

---

## Testing listings

For `Listing<Filters, Row>` classes, test the `search()` method directly:

```java
@Test
void search_returns_change_rows() {
    var queryService = new ChangeQueryService();
    var form = new CreateReleaseForm();
    var changes = new Changes(queryService, form);

    var result = changes.search("", new NoFilters(), Pageable.unpaged(), fakeRequest());

    assertThat(result.page().content()).isNotEmpty();
    assertThat(result.page().content().get(0)).isInstanceOf(ChangeRow.class);
}
```

---

## What to test

Focus on:

- **Actions**: call the method, assert the return value and side effects
- **State transitions**: verify field values after an action runs
- **Repository logic**: verify save, find, delete independently
- **Business rules**: any logic inside the ViewModel or service layer

Mateu generates the UI from your model. You do not need to test what Mateu generates.

---

## What not to test

- The generated forms and listings — Mateu handles this
- Routing — covered by integration tests
- UI rendering — no Mateu-specific test API required here

---

## Mental model

- ViewModels are plain Java → unit tests work with no ceremony
- Use constructor injection → test with real or fake collaborators, no mocks needed
- Test actions as regular methods → assert return values and state
- Integration test with `@SpringBootTest` → catches wiring errors

---

## Next

- [State, actions and fields](/java-user-manual/concepts/state-actions-and-fields/)
- [Action behavior](/java-user-manual/concepts/action-behavior/)
