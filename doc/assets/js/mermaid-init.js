document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('code.language-mermaid').forEach(function (el) {
    var pre = el.parentElement;
    var div = document.createElement('div');
    div.className = 'mermaid';
    div.textContent = el.textContent;
    pre.parentNode.replaceChild(div, pre);
  });

  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: true, theme: 'default' });
  }
});
