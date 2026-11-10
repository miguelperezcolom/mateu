The Vaadin → Redwood icon table (`poc/core/iconMap.mjs`) is GENERATED:

    node scripts/icons/genicons.mjs > poc/core/iconMap.mjs

`vaadin.txt` = the names of `@vaadin/icons` (vaadin-iconset.js); `oj.txt` = the `oj-ux-ico-*` names of the
gallery icon font (`static.oracle.com/cdn/fnd/gallery/<version>/images/iconfont/ojuxgallerybundle.min.css`).
Refresh `oj.txt` when the gallery version moves; edit the synonyms in `genicons.mjs`.
