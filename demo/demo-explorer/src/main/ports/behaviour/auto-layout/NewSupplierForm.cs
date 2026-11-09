// The C# twin (Mateu.NET): [AutoLayout] applies the same rules and thresholds as Java.
using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

[UI("new-supplier"), Title("New supplier"), AutoLayout]
public class NewSupplierForm
{
    [Required] public string? Name { get; set; }
    [Required] public string? Email { get; set; }
    [Required] public string? Phone { get; set; }
    [Multiline] public string? DeliveryNotes { get; set; }
    [Multiline] public string? BillingNotes { get; set; }
    [Multiline] public string? InternalNotes { get; set; }
    [Multiline] public string? Certifications { get; set; }
    public string? Website { get; set; }
}
