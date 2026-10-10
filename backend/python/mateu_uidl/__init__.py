"""Public API for defining Mateu views in Python.

Class shape is expressed with plain type hints; field modifiers ride in ``Annotated[...]`` metadata;
class- and method-level features are decorators. Mirrors the C# ``Mateu.Uidl`` attributes.

Example::

    from typing import Annotated
    from mateu_uidl import ui, title, button, Section, Required, Message

    @ui("person")
    @title("Person")
    class Person:
        name: Annotated[str | None, Required(), Section("Identity")] = None
        age: int = 0

        @button()
        def save(self) -> Message: return Message(f"Saved {self.name}")
"""

from __future__ import annotations

from .messages import (  # noqa: F401
    BannerTheme,
    Message,
    MessageVariant,
    T,
    UserFacingError,
)
from .markers import (  # noqa: F401
    Aggregate,
    AggregateFunction,
    BulletedList,
    Colspan,
    DetailForm,
    Disabled,
    FileUpload,
    GroupBy,
    Hidden,
    Label,
    Money,
    Multiline,
    OnRowSelected,
    Password,
    PhotoCapture,
    PlainText,
    PrimaryColumn,
    RangeFilter,
    ReadOnly,
    Required,
    RestOptions,
    RowStatus,
    Rule,
    Section,
    SeparatorBefore,
    Signature,
    Stereotype,
    Tab,
    Text,
    Tooltip,
    TreeSelect,
    UseRadioButtons,
    Version,
)
from .security import (  # noqa: F401
    Audience,
    audience,
    disabled_unless,
    DisabledUnless,
    eyes_only,
    EyesOnly,
    Identity,
    ReadOnlyUnless,
)
from .suppliers import (  # noqa: F401
    AppActionsSupplier,
    AppHeaderAction,
    AppNotification,
    AppShell,
    AppSupplier,
    GlobalSearchResult,
    GlobalSearchSupplier,
    InlineEditing,
    LookupLabelSupplier,
    MenuSupplier,
    NotificationsSupplier,
    PeerNav,
    PeerNavigationSupplier,
    RuleSupplier,
)
from .placement import (  # noqa: F401
    Aside,
    HeaderBadge,
    LinkTo,
    Lookup,
    NavLink,
    Panel,
    Searchable,
    Step,
    Timestamp,
)
from .class_decorators import (  # noqa: F401
    LabelsAsideMode,
    PageBanner,
    PageType,
    PageWidth,
    SizeMode,
    _Banner,
    _Fab,
    _ListToolbarButton,
    ai,
    app,
    app_context,
    auto_layout,
    auto_page,
    compact,
    confirm_on_navigation_if_dirty,
    edit_in_drawer,
    emits,
    folded_layout,
    form_layout,
    inline_editing,
    overline,
    page_template,
    page_width,
    plain_text,
    read_only,
    remote_menu,
    rest_action,
    rest_data,
    rest_listing,
    secured,
    size,
    static_view,
    subscribe_to,
    subtitle,
    title,
    title_placeholder,
    toc,
    ui,
    welcome_banner,
    wizard_progress,
    zones,
)
from .method_decorators import (  # noqa: F401
    MenuDisplay,
    MenuLook,
    _maybe_bare,
    action,
    action_options,
    banner,
    button,
    drag_rows,
    fab,
    kpi,
    list_toolbar_button,
    menu_group,
    menu_item,
    shortcut,
)
from .listing import (  # noqa: F401
    C,
    Creatable,
    Crud,
    D,
    DateRange,
    Deletable,
    E,
    Editable,
    F,
    Filterable,
    I,
    Listing,
    ListingData,
    Navigable,
    NumberRange,
    PageResult,
    Pageable,
    R,
    SearchRequest,
    SelectedItem,
    Selector,
    SortSpec,
)
from .views import (  # noqa: F401
    ComponentTreeSupplier,
    HeroSearch,
    LinkSupplier,
    SmartSearchPage,
    Translator,
    Wizard,
)
from .archetypes import (  # noqa: F401
    CollectionDetail,
    Dashboard,
    Foldout,
    GeneralOverview,
    ItemOverview,
    Welcome,
)
from .archetype_pages import (  # noqa: F401
    CalendarPage,
    DataManagement,
    GanttPage,
    TodoList,
)
from .flow import (  # noqa: F401
    CloseOverlay,
    Emit,
    FlowStep,
    MarkClean,
    MarkDirty,
    Navigate,
    RunAction,
)
from .constraints import (  # noqa: F401
    Max,
    Min,
    Pattern,
    Size,
    Validation,
    ValidationSupplier,
    validation,
)
from .rest_sources import (  # noqa: F401
    DeclaredRestSource,
    RestDataSource,
    RestSourceCatalogSupplier,
    RestSourceEntry,
    RestSourceKind,
    RestSourceProvenance,
    RestSourceSupplier,
    rest_source,
)


__all__ = [
    "eyes_only",
    "DeclaredRestSource",
    "RestDataSource",
    "RestSourceCatalogSupplier",
    "RestSourceEntry",
    "RestSourceKind",
    "RestSourceProvenance",
    "RestSourceSupplier",
    "rest_source",
    "Colspan",
    "DetailForm",
    "Max",
    "Min",
    "Pattern",
    "Size",
    "Validation",
    "ValidationSupplier",
    "validation",
    "Text",
    "UserFacingError",
    "MenuDisplay",
    "MenuLook",
    "menu_group",
    "Message", "MessageVariant", "BannerTheme", "PageBanner", "PageWidth", "PageType",
    "Required", "Label", "Section", "Tab", "Stereotype", "Multiline", "Password",
    "Money", "PlainText", "ReadOnly", "Version", "Lookup", "RestOptions", "Hidden", "Disabled", "OnRowSelected", "Tooltip", "InlineEditing", "EyesOnly", "ReadOnlyUnless", "DisabledUnless", "Identity", "disabled_unless", "Audience", "audience", "LookupLabelSupplier", "Rule", "RuleSupplier", "AppHeaderAction", "AppActionsSupplier", "PeerNav", "PeerNavigationSupplier", "AppNotification", "NotificationsSupplier", "BulletedList", "SeparatorBefore", "Signature", "PhotoCapture", "FileUpload", "RangeFilter", "Aggregate", "AggregateFunction", "GroupBy", "RowStatus", "TreeSelect", "UseRadioButtons", "HeaderBadge", "Timestamp", "Step", "Panel", "SizeMode", "size", "FlowStep", "Navigate", "Emit", "CloseOverlay", "RunAction", "MarkClean", "MarkDirty",
    "ai", "remote_menu", "ui", "title", "subtitle", "app", "auto_layout", "read_only", "compact",
    "static_view",
    "confirm_on_navigation_if_dirty", "inline_editing", "toc", "zones", "folded_layout", "form_layout", "LabelsAsideMode", "wizard_progress", "page_width", "page_template",
    "plain_text", "emits", "subscribe_to", "secured", "welcome_banner", "rest_listing", "drag_rows", "rest_action", "rest_data",
    "button", "action", "menu_item", "kpi", "fab", "banner", "shortcut", "list_toolbar_button",
    "Crud", "HeroSearch", "Listing", "SearchRequest", "ListingData", "Filterable", "Navigable", "Editable", "Creatable", "Deletable", "SmartSearchPage", "DateRange", "NumberRange", "Pageable", "PageResult", "SortSpec", "Searchable", "SelectedItem", "Selector", "Wizard", "Translator",
    "ComponentTreeSupplier", "Dashboard", "DataManagement", "Foldout", "GanttPage", "ItemOverview", "Welcome", "TodoList",
    "CalendarPage",
    "AppShell", "AppSupplier", "MenuSupplier",
]
