using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

namespace Mateu.Demo;

[UI("signup"), Title("Sign up")]
public class SignupWizard : Wizard
{
    [Required, Step(1)] public string? Email { get; set; }
    [Step(1)] public string? Company { get; set; }

    [Required, Step(2)] public string? Password { get; set; }
    [Step(2)] public bool AcceptTerms { get; set; }

    public override Message Complete() => new($"Welcome, {Email}!");
}
