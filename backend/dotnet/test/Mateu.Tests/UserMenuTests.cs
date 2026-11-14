using System.Security.Claims;
using System.Text.Json;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

[UI("user-menu"), App("User menu")]
public class UserMenuApp
{
    [MenuItem("Things")] public Things Home() => new();
}

/// <summary>The header's user menu (Java's UserMenuSyncTest + UserProfilesTest): the app shell names
/// the signed-in user (AppMetadataDto.User) — from the app's IUserProfileSupplier when it answers,
/// else from HttpContext.User's claims — and nobody for an anonymous caller.</summary>
public class UserMenuTests
{
    /// <summary>Knows how to show "ana"; says nothing about anyone else.</summary>
    private sealed class Directory : IUserProfileSupplier
    {
        public UserProfile? Profile(ClaimsPrincipal user) =>
            user.Identity?.Name == "ana" ? new UserProfile("Ana López", "ana@example.com", "https://example.com/ana.png") : null;
    }

    private sealed class Broken : IUserProfileSupplier
    {
        public UserProfile? Profile(ClaimsPrincipal user) => throw new InvalidOperationException("directory down");
    }

    private static ClaimsPrincipal User(params Claim[] claims) =>
        new(new ClaimsIdentity(claims, authenticationType: "test"));

    private static JsonElement Meta(Action<IServiceCollection>? services, HttpContext ctx)
    {
        var sc = new ServiceCollection();
        services?.Invoke(sc);
        sc.AddMateu(typeof(UserMenuApp).Assembly);
        var sp = sc.BuildServiceProvider();
        sp.GetRequiredService<IHttpContextAccessor>().HttpContext = ctx;
        var inc = sp.GetRequiredService<SyncHandler>().Handle(new RunActionRqDto
        {
            Route = "user-menu", ConsumedRoute = "_empty", ActionId = "",
            ServerSideType = typeof(UserMenuApp).FullName,
        });
        var json = JsonSerializer.Serialize(inc, MateuExtensions.Json);
        return JsonDocument.Parse(json).RootElement.GetProperty("fragments")[0]
            .GetProperty("component").GetProperty("metadata");
    }

    [Fact]
    public void An_anonymous_caller_is_named_nowhere()
    {
        Assert.False(Meta(null, new DefaultHttpContext()).TryGetProperty("user", out _));
    }

    [Fact]
    public void The_apps_supplier_decides_how_a_user_is_shown()
    {
        var user = Meta(sc => sc.AddSingleton<IUserProfileSupplier, Directory>(),
            new DefaultHttpContext { User = User(new Claim(ClaimTypes.Name, "ana")) }).GetProperty("user");
        Assert.Equal("Ana López", user.GetProperty("name").GetString());
        Assert.Equal("ana@example.com", user.GetProperty("email").GetString());
        Assert.Equal("https://example.com/ana.png", user.GetProperty("picture").GetString());
    }

    [Fact]
    public void When_the_supplier_says_nothing_the_authenticated_name_is_shown()
    {
        var user = Meta(sc =>
            {
                sc.AddSingleton<IUserProfileSupplier, Broken>();
                sc.AddSingleton<IUserProfileSupplier, Directory>();
            },
            new DefaultHttpContext { User = User(new Claim(ClaimTypes.Name, "clerk")) }).GetProperty("user");
        Assert.Equal("clerk", user.GetProperty("name").GetString());
        Assert.False(user.TryGetProperty("email", out _));
        Assert.False(user.TryGetProperty("picture", out _));
    }

    [Fact]
    public void The_claims_of_the_request_user_describe_them()
    {
        var user = Meta(null, new DefaultHttpContext
        {
            User = User(new Claim(ClaimTypes.Name, "ana"), new Claim(ClaimTypes.GivenName, "Ana"),
                new Claim(ClaimTypes.Surname, "López"), new Claim(ClaimTypes.Email, "ana@example.com"),
                new Claim("picture", "https://example.com/ana.png")),
        }).GetProperty("user");
        // ClaimTypes.Name counts as "name", which wins over given + family name
        Assert.Equal("ana", user.GetProperty("name").GetString());
        Assert.Equal("ana@example.com", user.GetProperty("email").GetString());
        Assert.Equal("https://example.com/ana.png", user.GetProperty("picture").GetString());
    }

    [Fact]
    public void A_short_claim_wins_over_its_long_spelling()
    {
        var claims = UserProfiles.ClaimsOf(User(new Claim(ClaimTypes.Name, "ana"), new Claim("name", "Ana López")));
        Assert.Equal("Ana López", UserProfiles.FromClaims(claims, "x").Name);
    }

    [Fact]
    public void An_oidc_user_is_shown_by_name_email_and_picture()
    {
        var profile = UserProfiles.FromClaims(new Dictionary<string, string?>
        {
            ["name"] = "Ana López", ["email"] = "ana@example.com",
            ["picture"] = "https://example.com/ana.png", ["preferred_username"] = "ana",
        }, "sub-1");
        Assert.Equal("Ana López", profile.Name);
        Assert.Equal("ana@example.com", profile.Email);
        Assert.Equal("https://example.com/ana.png", profile.Picture);
    }

    [Fact]
    public void A_github_user_is_shown_by_name_and_avatar()
    {
        var profile = UserProfiles.FromClaims(new Dictionary<string, string?>
        {
            ["login"] = "miguelperezcolom", ["name"] = "Miguel Pérez",
            ["avatar_url"] = "https://avatars.githubusercontent.com/u/1",
        }, "miguelperezcolom");
        Assert.Equal("Miguel Pérez", profile.Name);
        Assert.Equal("https://avatars.githubusercontent.com/u/1", profile.Picture);
        Assert.Null(profile.Email);
    }

    [Fact]
    public void Without_a_name_the_login_then_the_identitys_name_is_shown()
    {
        Assert.Equal("octocat", UserProfiles.FromClaims(new Dictionary<string, string?> { ["login"] = "octocat" }, "42").Name);
        Assert.Equal("Ana López", UserProfiles.FromClaims(
            new Dictionary<string, string?> { ["given_name"] = "Ana", ["family_name"] = "López" }, "x").Name);
        Assert.Equal("alice", UserProfiles.FromClaims(new Dictionary<string, string?>(), "alice").Name);
        Assert.Equal("alice", UserProfiles.FromClaims(new Dictionary<string, string?> { ["name"] = "  " }, "alice").Name);
    }

    [Fact]
    public void Only_an_http_picture_is_kept()
    {
        Assert.Null(UserProfiles.FromClaims(new Dictionary<string, string?> { ["picture"] = "javascript:alert(1)" }, "a").Picture);
        Assert.Equal("https://a.example/1", UserProfiles.FromClaims(
            new Dictionary<string, string?> { ["picture"] = "data:x", ["avatar_url"] = "https://a.example/1" }, "a").Picture);
    }

    [Fact]
    public void Nobody_without_an_identity_name()
    {
        Assert.Null(UserProfiles.Of(User(new Claim("name", "Ana")), null));
        Assert.Null(UserProfiles.Of(User(), "  "));
    }

    [Fact]
    public void A_profile_needs_a_name_and_drops_blank_details()
    {
        Assert.Throws<ArgumentException>(() => new UserProfile(" "));
        var p = new UserProfile("Ana", " ", "");
        Assert.Null(p.Email);
        Assert.Null(p.Picture);
    }
}
