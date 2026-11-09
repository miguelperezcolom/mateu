# The Python twin (mateu-ui): a Version() int field — every save bumps it; a save carrying an
# older version than the stored one opens the reload / overwrite conflict dialog.
from typing import Annotated

from mateu_ui.uidl import Crud, Version, title, ui


class Article:
    id: str = ""
    title: str = ""
    stock: int = 0
    version: Annotated[int, Version()] = 1


def _article(i: int) -> Article:
    a = Article()
    a.id, a.title, a.stock = f"A-{1 + i}", f"Article {1 + i}", i * 9 % 40
    return a


STORE = {a.id: a for a in (_article(i) for i in range(50))}


@ui("articles")
@title("Articles")
class ArticlesCrud(Crud[Article]):
    def fetch(self, search):
        return STORE.values()

    def get(self, id):
        return STORE.get(id)

    def save(self, entity):
        STORE[entity.id] = entity
