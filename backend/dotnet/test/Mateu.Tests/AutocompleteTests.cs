using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("autocomplete"), Title("Sign up")]
public class AutocompleteSignUpForm
{
    [Autocomplete("given-name")]
    public string FirstName { get; set; } = "";

    [Stereotype("email")]
    public string Contact { get; set; } = "";

    [Stereotype("email"), Autocomplete("off")]
    public string ReferrerEmail { get; set; } = "";

    public string Notes { get; set; } = "";
}

/// <summary>WCAG 1.3.5 Identify Input Purpose, Java's AutocompleteSyncTest in the port: a field
/// about the user carries its autocomplete token — declared with [Autocomplete], inferred only for
/// an editable email field.</summary>
public class AutocompleteTests
{
    [Fact]
    public void A_declared_purpose_travels_and_an_email_field_is_inferred()
    {
        var json = JsonSerializer.Serialize(
            new SyncHandler(new MateuRegistry(typeof(AutocompleteSignUpForm).Assembly))
                .Handle(new RunActionRqDto { ServerSideType = typeof(AutocompleteSignUpForm).FullName }));

        Assert.Contains("\"Autocomplete\":\"given-name\"", json);
        Assert.Contains("\"Autocomplete\":\"email\"", json);
        Assert.Contains("\"Autocomplete\":\"off\"", json);
    }

    [Fact]
    public void A_fluent_field_carries_its_declared_token()
    {
        var dto = new FormFieldMetadataDto("zip", "string", "Zip") { Autocomplete = "postal-code" };
        Assert.Equal("postal-code", dto.Autocomplete);
        Assert.Equal("postal-code", new FormField { FieldId = "zip", Autocomplete = "postal-code" }.Autocomplete);
    }
}
