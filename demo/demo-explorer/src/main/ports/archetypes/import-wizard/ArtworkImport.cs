// The C# twin (Mateu.NET): the same archetype — upload or paste a CSV, check the mapping, read the
// validation report, import the valid rows. You write the row class and ImportRows.
using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

[UI("import-wizard"), Title("Import artworks")]
public class ArtworkImport : ImportWizard<ArtworkImport.Artwork>
{
    public class Artwork
    {
        [Required] public string? Title { get; set; }
        public string? Artist { get; set; }
        public int Year { get; set; }
    }

    static readonly List<Artwork> Imported = [];

    protected override void ImportRows(List<Artwork> rows) => Imported.AddRange(rows);
}
