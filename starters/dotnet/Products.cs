using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

namespace MateuStarter;

public enum ProductStatus { Available, OutOfStock, Discontinued }

/// <summary>The model, declared once: columns, form fields and validation are derived from it.</summary>
public class Product
{
    [Required] public string Id { get; set; } = "";
    [Required] public string Name { get; set; } = "";
    [Range(0, double.MaxValue)] public double Price { get; set; }
    public ProductStatus Status { get; set; }
}

/// <summary>The whole UI: a CRUD over <see cref="Product"/> at /products.</summary>
[UI("products"), Title("Products")]
public class Products : Crud<Product>
{
    // The view model is created per request; the data lives in a static store that outlives it.
    private static readonly List<Product> Store =
    [
        new() { Id = "P-001", Name = "Espresso machine", Price = 249.0, Status = ProductStatus.Available },
        new() { Id = "P-002", Name = "Coffee grinder", Price = 89.5, Status = ProductStatus.Available },
        new() { Id = "P-003", Name = "Milk frother", Price = 39.9, Status = ProductStatus.OutOfStock },
        new() { Id = "P-004", Name = "Pour-over kettle", Price = 59.0, Status = ProductStatus.Discontinued },
    ];

    public override IEnumerable<Product> Fetch(string? search) =>
        string.IsNullOrWhiteSpace(search)
            ? Store
            : Store.Where(p => p.Name.Contains(search, StringComparison.OrdinalIgnoreCase)
                               || p.Id.Contains(search, StringComparison.OrdinalIgnoreCase));

    public override Product? Get(string id) => Store.FirstOrDefault(p => p.Id == id);

    public override void Save(Product product)
    {
        Store.RemoveAll(p => p.Id == product.Id);
        Store.Add(product);
    }

    public override void Delete(string id) => Store.RemoveAll(p => p.Id == id);
}
