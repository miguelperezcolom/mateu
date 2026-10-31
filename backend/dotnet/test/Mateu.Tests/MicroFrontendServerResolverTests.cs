using System.Collections.Concurrent;
using System.Reflection;
using System.Reflection.Emit;
using System.Text.Json;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Core.MicroFrontends;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

/// <summary>The pieces of server-side micro frontend resolution, in isolation — the port of Java's
/// MicroFrontendServerResolverTest, plus the [ContentSlot] key checks (the port's analogue of Java's
/// compile-time errors: they fail when the views are registered).</summary>
public class MicroFrontendServerResolverTests
{
    private const string Base = "https://orders.acme.com/ui";

    /// <summary>A transport whose calls never answer: what the resolver does with them is the point.</summary>
    private sealed class Hanging : HttpMessageHandler
    {
        public readonly ConcurrentQueue<CancellationToken> Calls = new();

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token)
        {
            Calls.Enqueue(token);
            await Task.Delay(Timeout.Infinite, token);
            throw new InvalidOperationException("unreachable");
        }
    }

    private sealed class Supplier(params RemoteDescriptor[] remotes) : IRemoteCatalogSupplier
    {
        public IReadOnlyList<RemoteDescriptor> Remotes() => remotes;
    }

    private static MicroFrontendServerResolver Resolver(HttpMessageHandler handler, params RemoteDescriptor[] remotes) => new(
        new DefaultRemoteRegistry([new Supplier(remotes.Length > 0 ? remotes : [new RemoteDescriptor("orders", Base, 100)])]),
        new HttpClient(handler), new InMemoryFragmentCacheStore(), new RemoteIdentityStrategies(),
        new DefaultCorrelationIdProvider(), [], MicroFrontendSettings.Defaults);

    private static UIIncrementDto PageWith(string baseUrl) => UIIncrementDto.Of(fragments:
    [
        new UIFragmentDto("page",
            new ClientSideComponentDto(new MicroFrontendMetadataDto(baseUrl, "/x")
            {
                Server = new ServerResolutionDto(80, null, null, null, true),
            }, "mfe", [], null, null, null),
            new Dictionary<string, object?>(), new Dictionary<string, object?>(), "Replace", null),
    ]);

    [Fact]
    public async Task The_call_still_running_at_the_deadline_is_cancelled()
    {
        var http = new Hanging();
        var resolved = await Resolver(http).ResolveAsync(PageWith(Base + "/orders"), new IncomingRequest());
        var token = Assert.Single(http.Calls);
        Assert.True(token.IsCancellationRequested);
        var microFrontend = (MicroFrontendMetadataDto)((ClientSideComponentDto)resolved.Fragments[0].Component!).Metadata;
        Assert.Null(microFrontend.Resolved);
        Assert.Null(microFrontend.Server);
        Assert.Equal(Base + "/orders", microFrontend.BaseUrl);
    }

    [Fact]
    public async Task A_url_that_only_looks_like_a_registered_remote_is_refused()
    {
        var http = new Hanging();
        foreach (var url in new[]
                 {
                     "https://orders.acme.com/uix",
                     "https://orders.acme.com.evil.io/ui",
                     "http://orders.acme.com/ui",
                     "https://orders.acme.com:8443/ui",
                     "https://orders.acme.com/ui/../admin",
                     "https://user@orders.acme.com/ui",
                 })
        {
            var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
                Resolver(http).ResolveAsync(PageWith(url), new IncomingRequest()));
            Assert.Contains("is not under any registered remote", error.Message);
        }
        Assert.Empty(http.Calls);
    }

    [Fact]
    public async Task An_unknown_identity_strategy_is_a_configuration_error_before_anything_is_asked()
    {
        var http = new Hanging();
        var error = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            Resolver(http, new RemoteDescriptor("orders", Base, 100, "exchange-me"))
                .ResolveAsync(PageWith(Base + "/x"), new IncomingRequest()));
        Assert.Contains("exchange-me", error.Message);
        Assert.Empty(http.Calls);
    }

    [Fact]
    public void Registry_matches_by_scheme_host_port_and_path_segment()
    {
        var registry = new DefaultRemoteRegistry(
            [
                new Supplier(
                    new RemoteDescriptor("root", "https://a.com"),
                    new RemoteDescriptor("deep", "https://a.com/x"),
                    new RemoteDescriptor("hub", "/_content-hub"),
                    new RemoteDescriptor("bad", "ftp://a.com")),
            ],
            [new RemoteDescriptor("props", "https://b.com/p", 250)]);
        Assert.Equal("deep", registry.ForUrl("https://a.com/x/y")?.Id);
        Assert.Equal("root", registry.ForUrl("https://a.com/xy")?.Id);
        Assert.Equal("deep", registry.ForUrl("https://A.com:443/x")?.Id);
        Assert.Equal("hub", registry.ForUrl("/_content-hub")?.Id);
        Assert.Null(registry.ForUrl("/_content-hubx"));
        Assert.Equal(250, registry.ForUrl("https://b.com/p/q")?.TimeoutMs);
        Assert.Null(registry.ById("bad")); // not an http(s) url: not registered
    }

    [CacheableFragment(30, VaryBy = "shared")]
    private sealed class AnnotatedView;

    private sealed class KeyedView : IFragmentCachePolicySupplier
    {
        public FragmentCachePolicy? CachePolicy(IncomingRequest request) => FragmentCachePolicy.ByKey("aud-A", 60);
    }

    [Fact]
    public void A_remote_view_declares_its_cache_policy_on_its_loads()
    {
        var page = PageWith(Base);
        var stamped = FragmentCachePolicies.Stamp(page, "", new IncomingRequest(), new AnnotatedView());
        Assert.Equal(30, stamped.FragmentCache!.MaxAgeSeconds);
        Assert.Equal("shared", stamped.FragmentCache.VaryBy);
        // only a load: an action's answer is never embedded by a host
        Assert.Null(FragmentCachePolicies.Stamp(page, "save", new IncomingRequest(), new AnnotatedView()).FragmentCache);
        Assert.Null(FragmentCachePolicies.Stamp(page, "", new IncomingRequest(), new object()).FragmentCache);
        // on the wire: key omitted when null, notModified omitted when false
        var json = JsonSerializer.Serialize(stamped, MateuExtensions.Json);
        Assert.Contains("\"fragmentCache\":{\"maxAgeSeconds\":30,\"varyBy\":\"shared\"}", json);
        Assert.DoesNotContain("fragmentCache", JsonSerializer.Serialize(page, MateuExtensions.Json));
    }

    [Fact]
    public void A_remote_answers_not_modified_without_the_fragments_when_the_host_holds_the_key()
    {
        var page = PageWith(Base);
        var held = new IncomingRequest(name => name == "X-Mateu-Fragment-Keys" ? "aud-B, aud-A" : null);
        var stamped = FragmentCachePolicies.Stamp(page, "", held, new KeyedView());
        Assert.True(stamped.FragmentCache!.NotModified);
        Assert.Empty(stamped.Fragments);
        var fresh = FragmentCachePolicies.Stamp(page, "", new IncomingRequest(), new KeyedView());
        Assert.False(fresh.FragmentCache!.NotModified);
        Assert.Equal("aud-A", fresh.FragmentCache.Key);
        Assert.Single(fresh.Fragments);
        Assert.Contains("\"notModified\":true", JsonSerializer.Serialize(stamped, MateuExtensions.Json));
    }

    [Fact]
    public void The_in_memory_store_expires_and_stays_bounded()
    {
        var now = DateTimeOffset.UnixEpoch;
        var store = new InMemoryFragmentCacheStore(2, () => now);
        store.Put("a", "1", TimeSpan.FromSeconds(10));
        Assert.Equal("1", store.Get("a"));
        now = now.AddSeconds(10);
        Assert.Null(store.Get("a"));
        store.Put("a", "1", TimeSpan.FromSeconds(10));
        store.Put("b", "2", TimeSpan.FromSeconds(10));
        store.Put("c", "3", TimeSpan.FromSeconds(10));
        Assert.Null(store.Get("a"));
        Assert.Equal("3", store.Get("c"));
        store.Put("z", "0", TimeSpan.Zero);
        Assert.Null(store.Get("z"));
    }

    [Fact]
    public void The_island_id_matches_the_renderers()
    {
        var microFrontend = new MicroFrontendMetadataDto("https://a.com/x", "/r") { ConsumedRoute = null!, ServerSideType = "T" };
        Assert.Equal("mfe_https___a_com_x__r__T", MicroFrontendIds.Of(microFrontend));
    }

    [Fact]
    public void The_correlation_id_is_the_callers_when_sane()
    {
        var provider = new DefaultCorrelationIdProvider();
        Assert.Equal("abc-1", provider.CorrelationId(new IncomingRequest(n => n == "X-Mateu-Correlation-Id" ? "abc-1" : null)));
        var forged = provider.CorrelationId(new IncomingRequest(n => n == "X-Mateu-Correlation-Id" ? "a\r\nInjected: 1" : null));
        Assert.DoesNotContain("\n", forged);
        Assert.Equal("4bf92f3577b34da6a3ce929d0e0e4736", provider.CorrelationId(new IncomingRequest(n =>
            n == "traceparent" ? "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01" : null)));
        Assert.Equal("trace-7", provider.CorrelationId(new IncomingRequest(traceIdentifier: "trace-7")));
    }

    [Fact]
    public void A_client_micro_frontend_maps_to_the_same_json_as_before()
    {
        var dto = ComponentMapper.Map(new MicroFrontend("https://a.com/x", "/r"));
        Assert.Equal(
            "{\"type\":\"MicroFrontend\",\"baseUrl\":\"https://a.com/x\",\"route\":\"/r\",\"consumedRoute\":\"_empty\","
            + "\"style\":null,\"cssClasses\":null,\"serverSideType\":\"\",\"appState\":null,\"actionId\":null}",
            JsonSerializer.Serialize(dto.Metadata, MateuExtensions.Json));
        // a server one carries no server-only info on the wire either, and is marked for resolution
        var server = ComponentMapper.Map(new MicroFrontend("https://a.com/x", "/r") { Resolve = Resolve.Server, TimeoutMs = 90 });
        Assert.Equal(JsonSerializer.Serialize(dto.Metadata, MateuExtensions.Json),
            JsonSerializer.Serialize(server.Metadata, MateuExtensions.Json));
        Assert.Equal(90, ((MicroFrontendMetadataDto)server.Metadata).Server!.TimeoutMs);
    }

    // ── [ContentSlot] keys: checked when the views are registered ─────────────────────────────

    [Fact]
    public void An_invalid_slot_key_fails()
    {
        var error = Assert.Throws<InvalidOperationException>(() => ContentSlotDescriptors.OfTypes(AssemblyWithSlotView("Front_Office.Home").GetTypes()));
        Assert.Contains("'Front_Office.Home'", error.Message);
        Assert.Contains("application.screen.name", error.Message);
    }

    [Fact]
    public void A_duplicated_slot_key_fails()
    {
        var error = Assert.Throws<InvalidOperationException>(() =>
            ContentSlotDescriptors.OfTypes(AssemblyWithSlotView("front-office.home.twice").GetTypes()
                .Concat(AssemblyWithSlotView("front-office.home.twice").GetTypes())));
        Assert.Contains("'front-office.home.twice'", error.Message);
        Assert.Contains("already used by", error.Message);
    }

    [Fact]
    public void Valid_keys_pass_with_more_segments_too()
    {
        Assert.Matches(ContentSlotDescriptors.KeyPattern(), "front-office.check-in.step-2.help");
        Assert.DoesNotMatch(ContentSlotDescriptors.KeyPattern(), "front-office.home");
        Assert.DoesNotMatch(ContentSlotDescriptors.KeyPattern(), "front-office..home.x");
        Assert.DoesNotMatch(ContentSlotDescriptors.KeyPattern(), "-front.home.x");
    }

    [Fact]
    public void A_view_with_an_invalid_slot_key_fails_registration_at_startup()
    {
        var invalid = AssemblyWithSlotView("Bad Key");
        var error = Assert.Throws<InvalidOperationException>(() => new MateuRegistry(invalid));
        Assert.Contains("'Bad Key'", error.Message);
        // AddMateu registers the views eagerly: the application does not start
        Assert.Throws<InvalidOperationException>(() => new ServiceCollection().AddMateu(invalid));
    }

    [Fact]
    public void Two_views_with_the_same_slot_key_fail_registration_at_startup()
    {
        var error = Assert.Throws<InvalidOperationException>(() =>
            new MateuRegistry(AssemblyWithSlotView("dup.app.slot"), AssemblyWithSlotView("dup.app.slot")));
        Assert.Contains("already used by", error.Message);
    }

    /// <summary>A [UI] view with one [ContentSlot] property, in an assembly of its own: a bad key in
    /// this test assembly would fail every registry the suite builds (every type of a registered
    /// assembly is checked, routed or not).</summary>
    private static Assembly AssemblyWithSlotView(string key)
    {
        var name = "MfeSlots" + Guid.NewGuid().ToString("N");
        var assembly = AssemblyBuilder.DefineDynamicAssembly(new AssemblyName(name), AssemblyBuilderAccess.Run);
        var type = assembly.DefineDynamicModule(name).DefineType(name + ".SlotView", TypeAttributes.Public | TypeAttributes.Class);
        type.SetCustomAttribute(new CustomAttributeBuilder(typeof(UIAttribute).GetConstructor([typeof(string)])!, ["slot-" + name]));
        var field = type.DefineField("_slot", typeof(string), FieldAttributes.Private);
        var property = type.DefineProperty("Slot", PropertyAttributes.None, typeof(string), null);
        var getter = type.DefineMethod("get_Slot", MethodAttributes.Public | MethodAttributes.SpecialName | MethodAttributes.HideBySig,
            typeof(string), Type.EmptyTypes);
        var il = getter.GetILGenerator();
        il.Emit(OpCodes.Ldarg_0);
        il.Emit(OpCodes.Ldfld, field);
        il.Emit(OpCodes.Ret);
        property.SetGetMethod(getter);
        property.SetCustomAttribute(new CustomAttributeBuilder(typeof(ContentSlotAttribute).GetConstructor(Type.EmptyTypes)!, [],
            [typeof(ContentSlotAttribute).GetProperty(nameof(ContentSlotAttribute.Key))!], [key]));
        type.CreateType();
        return assembly;
    }
}
