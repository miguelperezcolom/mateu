# The Python twin (mateu-ui): the same capability model — Listing[Book] alone is a grid, and each
# mixin adds one thing (search box, filter bar, clickable rows + detail, New, Delete).
from mateu_ui.uidl import (
    Creatable, Deletable, Filterable, Listing, Navigable, NumberRange, Searchable, title, ui,
)


class Book:
    id: str = ""
    title: str = ""
    author: str = ""
    pages: int = 0


class BookFilters:
    author: str | None = None
    pages: NumberRange | None = None


def _book(i: int) -> Book:
    b = Book()
    b.id, b.title, b.author, b.pages = f"B-{100 + i}", f"Book {i}", f"Author {i % 10}", 120 + i * 53 % 900
    return b


BOOKS = [_book(i) for i in range(50)]


@ui("books")
@title("Books")
class Books(Listing[Book], Searchable, Filterable[BookFilters], Navigable[Book, str],
            Creatable[Book, str], Deletable[str]):
    def search(self, request, http=None):
        text = (request.search_text or "").lower()
        f = self.filters(request)
        return [
            b for b in BOOKS
            if text in f"{b.title} {b.author}".lower()
            and (not f.author or f.author.lower() in b.author.lower())
            and (f.pages is None or f.pages.contains(b.pages))
        ]

    def view(self, id, http=None):
        return next(b for b in BOOKS if b.id == id)

    def creation_form(self, http=None):
        return Book()

    def create(self, form, http=None):
        form.id = f"B-{100 + len(BOOKS)}"
        BOOKS.append(form)
        return form.id

    def delete_all_by_id(self, selected_ids, http=None):
        BOOKS[:] = [b for b in BOOKS if b.id not in selected_ids]
