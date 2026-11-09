using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

[UI("text-validation")]
public class TextValidatedSignup
{
    [StringLength(8, MinimumLength = 3), RegularExpression("^[A-Z]+$")]
    public string? Code { get; set; }

    [MinLength(2)] public string? Nickname { get; set; }

    [MaxLength(5, ErrorMessage = "{0} is too long")] public string? Tag { get; set; }

    [RegularExpression("[0-9]{5}", ErrorMessage = "Five digits"), Hidden("state['code'] === ''")]
    public string? Zip { get; set; }

    [RegularExpression("[0-9]{5}")] public string? Reference { get; set; }

    [Button] public Message Save() => new("saved");
}

public class TextPart
{
    public string Id { get; set; } = "";

    [StringLength(10)] public string Name { get; set; } = "";

    [HiddenInCreate, RegularExpression("^[A-Z]{3}$")] public string Code { get; set; } = "";

    [HiddenInEditor, MinLength(3)] public string Origin { get; set; } = "";
}

[UI("text-parts"), Title("Parts"), InlineEditing]
public class TextParts : Crud<TextPart>
{
    public static readonly Dictionary<string, TextPart> Store = new();
    public override IEnumerable<TextPart> Fetch(string? search) => Store.Values;
    public override TextPart? Get(string id) => Store.GetValueOrDefault(id);
    public override void Save(TextPart entity)
    {
        if (string.IsNullOrEmpty(entity.Id)) entity.Id = "p" + (Store.Count + 1);
        Store[entity.Id] = entity;
    }
}

/// <summary>The length and pattern constraints ([StringLength] / [MinLength] / [MaxLength] = Java's
/// @Size, [RegularExpression] = @Pattern) on the server leg: re-checked before a validationRequired
/// button with the client's messages (Java's ServerSideValidationSyncTest), on a crud save over the
/// fields the form rendered, and on an inline-edited row as the edit form would. The client leg is
/// pinned by the validation-text conformance case.</summary>
[Collection("ProcessWideState")]
public class TextConstraintValidationTests
{
    private static SyncHandler Handler() => new(new MateuRegistry(typeof(TextValidatedSignup).Assembly));

    private static Dictionary<string, object?> State(object values) =>
        JsonSerializer.SerializeToElement(values).EnumerateObject()
            .ToDictionary(p => p.Name, p => (object?)p.Value);

    private static UIIncrementDto Button(object state) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = "text-validation",
            ActionId = "save",
            ServerSideType = typeof(TextValidatedSignup).FullName,
            ComponentState = State(state),
        });

    private sealed class SpanishTranslator : ITranslator
    {
        public string Translate(string key) => key switch
        {
            "Invalid format" => "Formato no válido",
            "Size must be between 2 and 2147483647" => "Al menos 2 caracteres",
            _ => key,
        };
    }

    [Fact]
    public void The_client_messages_go_through_the_translator_like_the_servers_refusal()
    {
        // Java's ConstraintValidationMapper.message / Python's mapper.T: the browser shows the same
        // text the server's refusal gives, in the app's language
        var inc = new SyncHandler(new MateuRegistry(typeof(TextValidatedSignup).Assembly), new SpanishTranslator())
            .Handle(new RunActionRqDto { Route = "text-validation", ConsumedRoute = "text-validation" });
        var json = JsonSerializer.Serialize(inc);
        Assert.Contains("Formato no v", json);
        Assert.Contains("Al menos 2 caracteres", json);
        Assert.DoesNotContain("Invalid format", json);
    }

    [Fact]
    public void A_valid_form_runs_the_button_and_an_absent_optional_value_passes()
    {
        Assert.Equal("saved", Button(new { code = "ABC", nickname = "", tag = (string?)null }).Messages.Single().Text);
    }

    [Fact]
    public void Broken_length_and_pattern_constraints_refuse_the_button_with_the_clients_messages()
    {
        var e = Assert.Throws<UserFacingException>(() =>
            Button(new { code = "abcdefghij", nickname = "x", tag = "toolong", zip = "nope" }));
        Assert.Equal("There are validation errors", e.Title);
        Assert.Contains("• Code: Size must be between 3 and 8", e.Message);
        Assert.Contains("• Code: Invalid format", e.Message);
        Assert.Contains("• Nickname: Size must be between 2 and 2147483647", e.Message);
        // the .NET ErrorMessage idiom: {0} is the field's label
        Assert.Contains("• Tag: Tag is too long", e.Message);
        // a [Hidden("expr")] field is the browser's to judge, as in Java's ServerConstraintCheck
        Assert.DoesNotContain("Zip", e.Message);
    }

    [Fact]
    public void A_pattern_is_a_find_like_the_clients_RegExp_test()
    {
        // "[0-9]{5}" is not anchored: JS /[0-9]{5}/.test("ref 12345") holds, so the server must agree
        Assert.Equal("saved", Button(new { reference = "ref 12345" }).Messages.Single().Text);
        var e = Assert.Throws<UserFacingException>(() => Button(new { reference = "ref 123" }));
        Assert.Contains("• Reference: Invalid format", e.Message);
    }

    private static UIIncrementDto Crud(string route, string actionId, object state) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = route, ConsumedRoute = "", ActionId = actionId,
            ServerSideType = typeof(TextParts).FullName,
            ComponentState = State(state),
        });

    private static void Seed()
    {
        TextParts.Store.Clear();
        TextParts.Store["p1"] = new TextPart { Id = "p1", Name = "Bolt", Code = "BLT", Origin = "Spain" };
    }

    [Fact]
    public void A_crud_create_refuses_a_broken_constraint_but_not_one_on_a_field_hidden_in_create()
    {
        Seed();
        var refused = Crud("/text-parts/new", "create", new { name = "far too long a name", origin = "ES" });
        var message = Assert.Single(refused.Messages);
        Assert.Equal("error", message.Variant);
        Assert.Contains("Name: Size must be between 0 and 10", message.Text);
        Assert.Contains("Origin: Size must be between 3 and 2147483647", message.Text);
        Assert.DoesNotContain("Code", message.Text);
        Assert.Single(TextParts.Store);

        Crud("/text-parts/new", "create", new { name = "Nut", origin = "France" });
        Assert.Equal(2, TextParts.Store.Count);
    }

    [Fact]
    public void A_crud_edit_save_checks_the_fields_of_the_edit_form()
    {
        Seed();
        TextParts.Store["p1"].Origin = "x"; // HiddenInEditor: the editor cannot fix it, so it is not asked
        var refused = Crud("/text-parts/p1/edit", "save", new { id = "p1", name = "Bolt", code = "bad" });
        var message = Assert.Single(refused.Messages);
        Assert.Equal("error", message.Variant);
        Assert.Contains("Code: Invalid format", message.Text);
        Assert.DoesNotContain("Origin", message.Text);
        Assert.Equal("BLT", TextParts.Store["p1"].Code);
    }

    [Fact]
    public void An_inline_edited_row_checks_what_the_edit_form_checks()
    {
        Seed();
        TextParts.Store["p1"].Origin = "x";
        var inc = Handler().Handle(new RunActionRqDto
        {
            ActionId = "update-row",
            ServerSideType = typeof(TextParts).FullName,
            Parameters = new() { ["_editedRow"] = JsonSerializer.SerializeToElement(new { id = "p1", name = "a name longer than ten" }) },
        });
        var message = Assert.Single(inc.Messages);
        Assert.Equal("error", message.Variant);
        Assert.Contains("Name: Size must be between 0 and 10", message.Text);
        Assert.DoesNotContain("Origin", message.Text);
        Assert.Equal("Bolt", TextParts.Store["p1"].Name);
    }
}
