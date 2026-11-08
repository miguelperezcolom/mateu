// The C# twin (Mateu.NET): DataAnnotations drive the same client + server checks.
// .NET reads [Required] and [Range]; there is no pattern/e-mail constraint in the port yet.
using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

[UI("sign-up"), Title("Sign up")]
public class SignUpForm
{
    [Required]
    public string? UserName { get; set; }

    [Required]
    public string? Email { get; set; }

    [Required, Range(18, 120)]
    public int? Age { get; set; }

    [Button]
    public Message SignUp()
    {
        if (UserName == "admin")
            throw new UserFacingException("That user name is taken", "Pick another one.");
        return new Message($"Welcome, {UserName}!");
    }
}
