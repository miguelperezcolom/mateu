# The Python twin (mateu-ui): @page_width(...) and @page_template(...).
from mateu_ui.uidl import PageType, PageWidth, page_template, page_width, title, ui


@ui("full-width")
@title("Full width")
@page_width(PageWidth.FULL_WIDTH)
class FullWidthPage:
    name: str = "Ada Lovelace"


@ui("collection-typed")
@title("Typed as a collection")
@page_template(PageType.COLLECTION)
class CollectionTypedPage:
    name: str = "Ada Lovelace"
