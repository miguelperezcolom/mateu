export enum AppVariant {
    HAMBURGUER_MENU = "HAMBURGUER_MENU",
    // the right spelling of HAMBURGUER_MENU: the server sends the old name, but a definition that
    // reaches the renderer without the server (YAML, a static bundle) may carry this one
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