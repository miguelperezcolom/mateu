// The C# twin (Mateu.NET): the same inference (1 column up to 6 fields, 2 from 7) and the same
// [FormLayout(Columns, LabelsAside)] declaration.
using Mateu.Uidl;

[UI("dense-form"), Title("Dense form — labels aside"), FormLayout(Columns = 1)]
public class DenseForm
{
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Company { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
}
