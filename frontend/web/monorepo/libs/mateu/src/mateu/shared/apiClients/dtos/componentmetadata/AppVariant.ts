export enum AppVariant {
    // the misspelling servers sent up to 3.0-alpha.411 — still accepted, so an older server (or a
    // static bundle built by one) keeps rendering
    HAMBURGUER_MENU = "HAMBURGUER_MENU",
    // the wire value since 3.0-alpha.412 (Java, .NET and Python servers send this one)
    HAMBURGER_MENU = "HAMBURGER_MENU",
    // Opera Cloud style: the hamburger holds the sections (the menu's first level), the band under
    // the header the second level of the section on screen. Never picked by AUTO.
    HAMBURGER_SECTIONS = "HAMBURGER_SECTIONS",
    MENU_ON_LEFT = "MENU_ON_LEFT",
    MENU_ON_TOP = "MENU_ON_TOP",
    TABS = "TABS",
    TILES = "TILES",
    RAIL = "RAIL",
    AUTO = "AUTO",
    MEDIATOR = "MEDIATOR"
}