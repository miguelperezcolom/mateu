using System.Net;
using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// <c>actions:</c> beside <c>layout:</c> on a definition-only page — the write half of the YAML DSL
/// (mirrors Java's YamlDeclaredActionsSyncTest and Python's test_yaml_declared_actions.py): the page
/// is wrapped so it carries ITS declared actions (never the <c>*</c> wildcard), a refused one
/// (<c>access:</c>) is not advertised, a rest action keeps its successRoute / validationRequired and
/// its body as a template, and a PROXIED one is served by <c>__restfetch__</c> from the definition —
/// the only channel that injects <c>${secret.X}</c> — while a direct one is the browser's to call.
/// </summary>
public class YamlDeclaredActionsTests
{
    private static string Specs()
    {
        var dir = Directory.CreateTempSubdirectory("yaml-actions-").FullName;
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), """
            routes:
              - route: people/new
                layout: new.yaml
                state:
                  name: Leia
              - route: guarded
                layout: guarded.yaml
              - route: about
                layout: about.yaml
            """);
        File.WriteAllText(Path.Combine(dir, "sources.yaml"), """
            sources:
              - name: swapi-people
                source:
                  url: https://swapi.test/people
                  method: POST
                  proxy: true
                  headers: {X-Api-Key: "${secret.SWAPI}"}
            """);
        File.WriteAllText(Path.Combine(dir, "new.yaml"), """
            actions:
              - id: create
                restAction:
                  source: {ref: swapi-people}
                  successMessage: Created
              - id: save
                restAction:
                  source:
                    url: https://example.test/api/people
                    method: POST
                    body: '{"name":"${state.name}"}'
                  successMessage: Saved
                  successRoute: people/${state.id}
              - id: remove
                restAction:
                  source:
                    url: https://example.test/api/people/${state.id}
                    method: DELETE
                    proxy: true
                    headers: {X-Api-Key: "${secret.WRITE_KEY}"}
                  successMessage: Deleted
              - id: back
                steps:
                  - {type: Navigate, route: people}
              - id: purge
                access: {roles: [admin]}
                restAction:
                  source: {url: "https://example.test/purge", method: DELETE, proxy: true}
            layout:
              type: VerticalLayout
              content:
                - {type: FormField, id: name, label: Name}
                - {type: FormField, id: title, label: Title, required: true}
                - {type: Button, label: Create, actionId: create}
            """);
        File.WriteAllText(Path.Combine(dir, "guarded.yaml"), """
            type: Form
            title: Guarded
            confirmOnNavigationIfDirty: true
            content:
              - {type: FormField, id: title, label: Title, dataType: string}
            actions:
              - id: save
                validationRequired: true
                restAction:
                  source: {url: "https://api.example/things", method: POST}
                  successMessage: Saved
            """);
        File.WriteAllText(Path.Combine(dir, "about.yaml"), """
            layout:
              type: VerticalLayout
              content:
                - {type: Text, text: About}
            """);
        return dir;
    }

    private static readonly string Dir = Specs();

    private sealed class RecordingHttp : HttpMessageHandler
    {
        public HttpRequestMessage? Last;
        public string? Body;

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Last = request;
            Body = request.Content is null ? null : await request.Content.ReadAsStringAsync(ct);
            return new HttpResponseMessage(HttpStatusCode.OK) { Content = new StringContent("{\"id\":7}") };
        }
    }

    private static SyncHandler Handler(HttpClient? http = null, params string[] roles) =>
        new(new MateuRegistry(typeof(YamlDeclaredActionsTests).Assembly),
            identity: () => roles.Length == 0 ? null : new Identity(Roles: roles),
            secrets: name => "k-" + name, http: http, specsDir: Dir);

    private static (ServerSideComponentDto Page, UIFragmentDto Fragment) Load(SyncHandler handler, string route)
    {
        var fragment = handler.Handle(new RunActionRqDto { Route = route, ConsumedRoute = "_empty" }).Fragments[0];
        return (Assert.IsType<ServerSideComponentDto>(fragment.Component), fragment);
    }

    private static string Json(object o) =>
        JsonSerializer.Serialize(o, new JsonSerializerOptions(JsonSerializerDefaults.Web));

    [Fact]
    public void The_page_advertises_its_declared_actions_and_never_the_wildcard()
    {
        var (page, _) = Load(Handler(), "/people/new");
        // purge is refused to an anonymous caller; __restfetch__ because a declared call is proxied
        Assert.Equal(["create", "save", "remove", "back", "__restfetch__"], page.Actions.Select(a => a.Id));
        Assert.DoesNotContain(page.Actions, a => a.Id == "*");
    }

    [Fact]
    public void An_admin_sees_the_restricted_action()
    {
        var (page, _) = Load(Handler(null, "admin"), "/people/new");
        Assert.Contains(page.Actions, a => a.Id == "purge");
    }

    [Fact]
    public void It_carries_the_rest_call_the_client_will_make()
    {
        var (page, _) = Load(Handler(), "/people/new");
        var save = page.Actions.Single(a => a.Id == "save");
        Assert.False(save.ValidationRequired);
        Assert.Equal("https://example.test/api/people", save.RestAction!.Source.Url);
        Assert.Equal("POST", save.RestAction.Source.Method);
        // the body and the successRoute are TEMPLATES, resolved by the client at the click
        Assert.Contains("${state.name}", save.RestAction.Source.Body);
        Assert.Equal("Saved", save.RestAction.SuccessMessage);
        Assert.Equal("people/${state.id}", save.RestAction.SuccessRoute);
        Assert.Contains("\"successRoute\":\"people/${state.id}\"", Json(save));
        // a flow is lowered to its command
        var back = page.Actions.Single(a => a.Id == "back");
        Assert.Equal("NavigateTo", Assert.Single(back.Commands!).Type);
    }

    [Fact]
    public void A_secret_is_not_resolved_on_the_wire_that_travels_to_the_browser()
    {
        var (page, _) = Load(Handler(), "/people/new");
        var remove = page.Actions.Single(a => a.Id == "remove");
        Assert.True(remove.RestAction!.Source.Proxy);
        // a proxied call's headers do not travel at all — not even the placeholder
        Assert.Equal(JsonValueKind.Null,
            JsonDocument.Parse(Json(remove.RestAction.Source)).RootElement.GetProperty("headers").ValueKind);
        Assert.DoesNotContain("X-Api-Key", Json(page));
        Assert.DoesNotContain("WRITE_KEY", Json(page));
        // a by-ref surface carries only the name: the endpoint (and its secret) stays on the server
        var create = page.Actions.Single(a => a.Id == "create");
        Assert.Equal("swapi-people", create.RestAction!.Source.Ref);
        Assert.DoesNotContain("SWAPI", Json(page));
    }

    [Fact]
    public void A_required_field_is_validated_like_a_class_one_and_the_state_is_still_seeded()
    {
        var (page, fragment) = Load(Handler(), "/people/new");
        var validation = Assert.Single(page.Validations);
        Assert.Equal("title", validation.FieldId);
        Assert.Equal("Cannot be empty", validation.Message);
        Assert.Equal(
            "state['title'] != null && state['title'] !== '' && (state['title'].length === undefined || state['title'].length > 0)",
            validation.Condition);
        Assert.Contains("Leia", Json(fragment));
        Assert.Equal("form", page.PageType);
    }

    [Fact]
    public void A_page_declares_that_leaving_it_with_unsaved_changes_asks()
    {
        var (guarded, _) = Load(Handler(), "/guarded");
        Assert.True(guarded.ConfirmOnNavigationIfDirty);
        Assert.True(guarded.Actions.Single(a => a.Id == "save").ValidationRequired);
        Assert.False(Load(Handler(), "/people/new").Page.ConfirmOnNavigationIfDirty);
    }

    [Fact]
    public void A_page_without_declared_actions_claims_none()
    {
        var component = Handler().Handle(new RunActionRqDto { Route = "/about", ConsumedRoute = "_empty" })
            .Fragments[0].Component;
        if (component is ServerSideComponentDto serverSide) Assert.Empty(serverSide.Actions);
    }

    [Fact]
    public async Task A_proxied_rest_action_runs_on_the_server_with_its_secret()
    {
        var http = new RecordingHttp();
        var answer = await Handler(new HttpClient(http)).HandleAsync(new RunActionRqDto
        {
            Route = "/people/new",
            ActionId = "__restfetch__",
            ComponentState = new Dictionary<string, object?> { ["id"] = "P-1" },
            Parameters = new Dictionary<string, object?> { ["_sourceKind"] = "action", ["_sourceId"] = "remove" },
        });
        Assert.Equal(HttpMethod.Delete, http.Last!.Method);
        Assert.Equal("https://example.test/api/people/P-1", http.Last.RequestUri!.ToString());
        Assert.Equal("k-WRITE_KEY", http.Last.Headers.GetValues("X-Api-Key").Single());
        Assert.Contains("\"id\":7", Json(answer.AppData!));
    }

    [Fact]
    public async Task A_by_ref_proxied_action_is_resolved_off_the_catalogue()
    {
        var http = new RecordingHttp();
        await Handler(new HttpClient(http)).HandleAsync(new RunActionRqDto
        {
            Route = "/people/new",
            ActionId = "__restfetch__",
            Parameters = new Dictionary<string, object?> { ["_sourceKind"] = "action", ["_sourceId"] = "create" },
        });
        Assert.Equal("https://swapi.test/people", http.Last!.RequestUri!.ToString());
        Assert.Equal(HttpMethod.Post, http.Last.Method);
        Assert.Equal("k-SWAPI", http.Last.Headers.GetValues("X-Api-Key").Single());
    }

    [Fact]
    public async Task A_direct_rest_action_is_not_proxied_on_request()
    {
        await Assert.ThrowsAsync<MateuForbiddenException>(() => Handler().HandleAsync(new RunActionRqDto
        {
            Route = "/people/new",
            ActionId = "__restfetch__",
            Parameters = new Dictionary<string, object?> { ["_sourceKind"] = "action", ["_sourceId"] = "save" },
        }));
    }

    [Fact]
    public async Task A_refused_action_is_not_proxied_for_the_caller()
    {
        await Assert.ThrowsAsync<MateuForbiddenException>(() => Handler().HandleAsync(new RunActionRqDto
        {
            Route = "/people/new",
            ActionId = "__restfetch__",
            Parameters = new Dictionary<string, object?> { ["_sourceKind"] = "action", ["_sourceId"] = "purge" },
        }));
    }
}
