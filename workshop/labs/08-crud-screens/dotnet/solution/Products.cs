using System.ComponentModel.DataAnnotations;
using Mateu.Uidl;

namespace Workshop;

public enum ProductStatus { Available, OutOfStock, Discontinued }

/// <summary>The model, declared once: columns, form fields and validation are derived from it.
/// Workshop, lab 01: <see cref="Stock"/> is the property you added. Lab 08: <see cref="AddedOn"/>
/// is not on the creation form ([HiddenInCreate]) and is never typed ([ReadOnly]) — the store sets
/// it; <see cref="Id"/> is typed on New and read-only afterwards ([EditableOnlyWhenCreating]).</summary>
public class Product
{
    // a product code the user types on create (without the attribute the id would be technical:
    // the store assigns it and the creation form draws no input for it)
    [Required, EditableOnlyWhenCreating] public string Id { get; set; } = "";
    [Required] public string Name { get; set; } = "";
    [Range(0, double.MaxValue), Money] public double Price { get; set; }
    [Range(0, int.MaxValue)] public int Stock { get; set; }
    // the New form starts from new Product(): the initializer is its default
    public ProductStatus Status { get; set; } = ProductStatus.Available;
    [HiddenInCreate, ReadOnly] public DateOnly? AddedOn { get; set; }

    // The record's name: its page is titled "Espresso machine", not "Product".
    public override string ToString() => string.IsNullOrWhiteSpace(Name) ? "New product" : Name;
}

/// <summary>A CRUD over <see cref="Product"/> at /products, reached from the Products menu entry
/// of <see cref="Shell"/>.</summary>
[UI("products"), Title("Products")]
public class Products : Crud<Product>
{
    private static readonly DateOnly Added = new(2026, 1, 15);

    // The view model is created per request; the data lives in a static store that outlives it.
    private static readonly List<Product> Store =
    [
        new() { Id = "P-001", Name = "Espresso machine", Price = 249.0, Stock = 12, Status = ProductStatus.Available, AddedOn = Added },
        new() { Id = "P-002", Name = "Coffee grinder", Price = 89.5, Stock = 30, Status = ProductStatus.Available, AddedOn = Added },
        new() { Id = "P-003", Name = "Milk frother", Price = 39.9, Stock = 0, Status = ProductStatus.OutOfStock, AddedOn = Added },
        new() { Id = "P-004", Name = "Pour-over kettle", Price = 59.0, Stock = 3, Status = ProductStatus.Discontinued, AddedOn = Added },
    ];

    public override IEnumerable<Product> Fetch(string? search) =>
        string.IsNullOrWhiteSpace(search)
            ? Store
            : Store.Where(p => p.Name.Contains(search, StringComparison.OrdinalIgnoreCase)
                               || p.Id.Contains(search, StringComparison.OrdinalIgnoreCase));

    public override Product? Get(string id) => Store.FirstOrDefault(p => p.Id == id);

    public override void Save(Product product)
    {
        // Workshop, lab 08: the creation form has no AddedOn — the store fills it in
        product.AddedOn ??= DateOnly.FromDateTime(DateTime.Today);
        Store.RemoveAll(p => p.Id == product.Id);
        Store.Add(product);
    }

    public override void Delete(string id) => Store.RemoveAll(p => p.Id == id);
}
