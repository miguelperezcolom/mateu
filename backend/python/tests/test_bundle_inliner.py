"""The bundle's build-time pieces on their own: the definition inliner (partials and business
components a shipped definition references, Java's DefinitionInliner) and the static-app copy of
the bundle writer (Java's BundleWriter)."""

import zipfile

from mateu_ui.bundle import inliner as inl
from mateu_ui.bundle.inliner import DefinitionInliner
from mateu_ui.bundle.writer import base_path_of, copy_static_app
from mateu_ui.core import ui_page


def text(t: str) -> dict:
    return {"type": "Text", "text": t}


def specs(tmp_path, partials=None, components=None):
    folder = tmp_path / "partials"
    folder.mkdir()
    for name, body in (partials or {}).items():
        (folder / f"{name}.yaml").write_text(body)
    if components is not None:
        (tmp_path / "components.yaml").write_text(components)
    return DefinitionInliner(tmp_path)


def test_a_partial_of_one_component_takes_its_place_and_several_are_spliced_into_the_list(tmp_path):
    i = specs(tmp_path, {
        "one": "type: Text\ntext: one\n",
        "two": "content:\n  - {type: Text, text: a}\n  - {type: Text, text: b}\n",
    })
    page = {"type": "VerticalLayout", "content": [{"type": "Partial", "ref": "two"}, text("c")],
            "header": {"type": "Partial", "ref": "one"}}
    out = i.inline(page)
    assert out["content"] == [text("a"), text("b"), text("c")]
    assert out["header"] == text("one")


def test_a_partial_of_several_components_in_a_single_slot_is_stacked(tmp_path):
    i = specs(tmp_path, {"two": "content:\n  - {type: Text, text: a}\n  - {type: Text, text: b}\n"})
    assert i.inline({"type": "Card", "content": {"type": "Partial", "ref": "two"}})["content"] == {
        "type": "VerticalLayout", "content": [text("a"), text("b")]
    }
    # the definition itself being a partial reference
    assert i.inline({"type": "Partial", "ref": "two"}) == {
        "type": "VerticalLayout", "content": [text("a"), text("b")]
    }


def test_partials_compose_and_a_cycle_is_left_as_it_was(tmp_path):
    i = specs(tmp_path, {
        "outer": "content:\n  - {type: Partial, ref: inner}\n  - {type: Text, text: x}\n",
        "inner": "type: Text\ntext: inner\n",
        "loop": "content:\n  - {type: Partial, ref: loop}\n",
    })
    assert i.inline([{"type": "Partial", "ref": "outer"}]) == [text("inner"), text("x")]
    assert i.inline([{"type": "Partial", "ref": "loop"}]) == [{"type": "Partial", "ref": "loop"}]


def test_what_cannot_be_inlined_stays_a_reference(tmp_path):
    (tmp_path / "partials").mkdir()
    (tmp_path / "partials" / "broken.yaml").write_text("content: [\n")
    i = DefinitionInliner(tmp_path)
    for ref in ("missing", "com.acme.ClassPartial", "broken"):
        node = {"type": "Partial", "ref": ref}
        assert i.inline([node]) == [node]
    # no ref, and a reference of a kind the inliner does not know
    assert i.inline([{"type": "Partial"}, {"type": "Other", "ref": "x"}]) == [
        {"type": "Partial"}, {"type": "Other", "ref": "x"}
    ]


def test_a_business_component_is_inlined_and_a_self_reference_or_an_unknown_one_is_left(tmp_path):
    i = specs(tmp_path, components=(
        "components:\n"
        "  - name: greeting\n    component: {type: Text, text: hi}\n"
        "  - name: self\n    component: {type: Card, content: [{type: ComponentRef, ref: self}]}\n"
        "  - {name: nothing}\n"
    ))
    assert i.inline([{"type": "ComponentRef", "ref": "greeting"}]) == [text("hi")]
    assert i.inline([{"type": "ComponentRef", "ref": "unknown"}]) == [{"type": "ComponentRef", "ref": "unknown"}]
    assert i.inline([{"type": "ComponentRef", "ref": "self"}]) == [
        {"type": "Card", "content": [{"type": "ComponentRef", "ref": "self"}]}
    ]
    assert set(i.components()) == {"greeting", "self"}


def test_an_unreadable_catalogue_has_no_component_and_too_deep_a_nesting_stops(tmp_path, monkeypatch):
    (tmp_path / "components.yaml").write_text("components: [\n")
    assert DefinitionInliner(tmp_path).components() == {}
    deep = tmp_path / "deep"
    deep.mkdir()
    i = specs(deep, {"a": "content:\n  - {type: Partial, ref: b}\n", "b": "type: Text\ntext: b\n"})
    monkeypatch.setattr(inl, "MAX_DEPTH", 1)
    assert i.inline([{"type": "Partial", "ref": "a"}]) == [{"type": "Partial", "ref": "b"}]


def test_the_bundle_base_path_of_a_base_url():
    assert base_path_of(None) == "" and base_path_of("  ") == ""
    assert base_path_of("https://cdn.example.com/app/") == "/app"
    assert base_path_of("/app/") == "/app"
    assert base_path_of("http://[::1") == ""  # unparseable: no base path


def test_the_static_app_is_copied_from_a_jar_without_its_template_nor_a_zip_slip(tmp_path):
    jar = tmp_path / "renderer.jar"
    with zipfile.ZipFile(jar, "w") as z:
        z.writestr("static/_index.html", "<html></html>")
        z.writestr("static/assets/app.js", "js")
        z.writestr("static/assets/", "")
        z.writestr("static/../../evil.txt", "x")
        z.writestr("META-INF/MANIFEST.MF", "m")
    out = tmp_path / "out"
    out.mkdir()
    copy_static_app(ui_page.RendererFiles(jar), out)
    assert (out / "assets" / "app.js").read_text() == "js"
    assert not (out / ui_page.INDEX).exists()
    assert not (tmp_path / "evil.txt").exists() and not (out / "META-INF").exists()


def test_the_static_app_is_copied_from_a_folder(tmp_path):
    source = tmp_path / "static"
    (source / "assets").mkdir(parents=True)
    (source / "_index.html").write_text("<html></html>")
    (source / "assets" / "app.js").write_text("js")
    (source / "favicon.png").write_bytes(b"png")
    out = tmp_path / "out"
    out.mkdir()
    copy_static_app(ui_page.RendererFiles(source), out)
    assert (out / "assets" / "app.js").read_text() == "js" and (out / "favicon.png").read_bytes() == b"png"
    assert not (out / ui_page.INDEX).exists()


def test_a_typed_partial_root_is_kept_whole_and_document_access_keys_are_kept(tmp_path):
    # the same structure the server composes (Java DefinitionInlinerTest): a typed root IS one
    # component; a type-less / `type: Partial` document is spliced with its own access keys (and
    # those of the reference) kept on a wrapper — cosmetic in a bundle, but never lost
    i = specs(tmp_path, {
        "secret-card": "type: Card\ntitle: Secret\neyesOnly: ADMIN\ncontent:\n  - {type: Text, text: confidential}\n",
        "headed": "type: Partial\neyesOnly: ADMIN\ncontent:\n  - {type: Text, text: headed}\n",
        "plain": "content:\n  - {type: Text, text: plain}\n",
    })
    out = i.inline({"type": "VerticalLayout", "content": [
        {"type": "Partial", "ref": "secret-card"},
        {"type": "Partial", "ref": "headed"},
        {"type": "Partial", "ref": "plain", "eyesOnly": "ADMIN"},
    ]})["content"]
    assert out[0] == {"type": "Card", "title": "Secret", "eyesOnly": "ADMIN", "content": [text("confidential")]}
    assert out[1] == {"type": "VerticalLayout", "eyesOnly": "ADMIN", "content": [text("headed")]}
    assert out[2] == {"type": "VerticalLayout", "eyesOnly": "ADMIN", "content": [text("plain")]}
