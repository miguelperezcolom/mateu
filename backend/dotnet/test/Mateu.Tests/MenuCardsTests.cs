using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures ──────────────────────────────────────────────────────────────────────────────────

[Title("Reservations")] public class CardsReservationsPage { public string Name { get; set; } = "reservations"; }
[Title("New reservation")] public class CardsNewReservationPage { public string Name { get; set; } = "new"; }
[Title("Room diary")] public class CardsRoomDiaryPage { public string Name { get; set; } = "diary"; }

/// <summary>A menu group that opens as a panel of CARDS (mirror of Java's MenuCardsSyncTest.Root):
/// [MenuGroup(Display = "cards")] on the folder, [MenuGroup] look on a nested folder (a card WITH
/// actions — its entries), [MenuItem(Description/Icon/Image)] on a leaf card.</summary>
[App("PMS")]
[MenuGroup("Bookings", Display = MenuDisplay.Cards)]
[MenuGroup("Bookings/Reservations", Description = "Search, create and modify reservations",
    Icon = "vaadin:calendar", Image = "/img/res.png")]
public class CardsMenuApp
{
    [MenuItem("Search", Group = "Bookings/Reservations")] public CardsReservationsPage Search() => new();
    [MenuItem("Create", Group = "Bookings/Reservations")] public CardsNewReservationPage Create() => new();

    [MenuItem("Room diary", Group = "Bookings", Description = "Rooms by day, drag to move a stay")]
    public CardsRoomDiaryPage RoomDiary() => new();

    [MenuItem("Plain")] public CardsRoomDiaryPage Plain() => new();
}

/// <summary>The same card menu authored IN CODE (IMenuSupplier): the wire props are set directly.</summary>
[App("PMS code")]
public class CodeCardsMenuApp : IMenuSupplier
{
    public IReadOnlyList<MenuItemDto> Menu() =>
    [
        new("Bookings", "", "")
        {
            Display = MenuDisplay.Cards,
            Submenus =
            [
                new("Reservations", "", "")
                {
                    Description = "Search, create and modify reservations",
                    Icon = "vaadin:calendar",
                    Image = "/img/res.png",
                    Submenus = [new("Search", "/search", ""), new("Create", "/create", "")],
                },
            ],
        },
    ];
}

// ── Tests ─────────────────────────────────────────────────────────────────────────────────────

/// <summary>Card menus — the .NET mirror of Java's MenuCardsSyncTest: the group carries display
/// "cards"; each card its description, icon and image, and its own children (the card's actions).
/// A plain menu travels exactly as before (no display, no image, no icon).</summary>
public class MenuCardsTests
{
    private static AppMetadataDto App(Type appType)
    {
        var handler = new SyncHandler(new MateuRegistry(appType.Assembly));
        return (AppMetadataDto)((ClientSideComponentDto)handler
            .Handle(new RunActionRqDto { ServerSideType = appType.FullName })
            .Fragments.Single().Component!).Metadata;
    }

    private static MenuItemDto? Find(IEnumerable<MenuItemDto> menu, string label)
    {
        foreach (var option in menu)
        {
            if (option.Label == label) return option;
            if (Find(option.Submenus, label) is { } found) return found;
        }
        return null;
    }

    [Fact]
    public void A_cards_group_carries_its_display_and_each_card_its_look()
    {
        var group = Find(App(typeof(CardsMenuApp)).Menu, "Bookings")!;
        Assert.Equal("cards", group.Display);
        var card = Find(group.Submenus, "Reservations")!;
        Assert.Equal("Search, create and modify reservations", card.Description);
        Assert.Equal("/img/res.png", card.Image);
        Assert.Equal("vaadin:calendar", card.Icon);
        Assert.Null(card.Display);
        // the card's own children are its actions
        Assert.Equal(["Search", "Create"], card.Submenus.Select(s => s.Label));
        var leafCard = Find(group.Submenus, "Room diary")!;
        Assert.Equal("Rooms by day, drag to move a stay", leafCard.Description);
        Assert.Empty(leafCard.Submenus);
    }

    [Fact]
    public void A_plain_entry_travels_as_before()
    {
        var plain = Find(App(typeof(CardsMenuApp)).Menu, "Plain")!;
        Assert.Null(plain.Display);
        Assert.Null(plain.Image);
        Assert.Null(plain.Icon);
        Assert.Null(plain.Description);
    }

    [Fact]
    public void The_card_fields_travel_on_the_wire_with_the_java_names()
    {
        var json = System.Text.Json.JsonSerializer.Serialize(App(typeof(CardsMenuApp)),
            new System.Text.Json.JsonSerializerOptions { PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase });
        Assert.Contains("\"display\":\"cards\"", json);
        Assert.Contains("\"image\":\"/img/res.png\"", json);
        Assert.Contains("\"description\":\"Rooms by day, drag to move a stay\"", json);
    }

    [Fact]
    public void A_code_authored_menu_carries_the_card_look()
    {
        var group = Find(App(typeof(CodeCardsMenuApp)).Menu, "Bookings")!;
        Assert.Equal("cards", group.Display);
        var card = Find(group.Submenus, "Reservations")!;
        Assert.Equal("/img/res.png", card.Image);
        Assert.Equal(["Search", "Create"], card.Submenus.Select(s => s.Label));
    }
}
