package com.example.demo.infra.ui.menus.components.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Icon;
import io.mateu.uidl.data.IconChooser;

@Title("Icons")
public class IconForm {

    @CallActionOnChange("changeIcon")
    IconChooser chooseIcon;

    @Style("height: var(--lumo-icon-size-l); width: var(--lumo-icon-size-l);")
    io.mateu.uidl.interfaces.Icon icon = io.mateu.uidl.interfaces.Icon.Abacus;

    @CallActionOnClick("assess")
    @Style("height: 48px; width: 48px;color: red;")
    io.mateu.uidl.interfaces.Icon clickableIcon = io.mateu.uidl.interfaces.Icon.Airplane;

    @Icon(style = "height: var(--lumo-icon-size-l); width: var(--lumo-icon-size-l);")
    //String iconFromSvg = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgRnJlZSA2LjQuMiBieSBAZm9udGF3ZXNvbWUgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbSBMaWNlbnNlIC0gaHR0cHM6Ly9mb250YXdlc29tZS5jb20vbGljZW5zZS9mcmVlIChJY29uczogQ0MgQlkgNC4wLCBGb250czogU0lMIE9GTCAxLjEsIENvZGU6IE1JVCBMaWNlbnNlKSBDb3B5cmlnaHQgMjAyMyBGb250aWNvbnMsIEluYy4gLS0+PHBhdGggZD0iTTgwIDEwNGEyNCAyNCAwIDEgMCAwLTQ4IDI0IDI0IDAgMSAwIDAgNDh6bTgwLTI0YzAgMzIuOC0xOS43IDYxLTQ4IDczLjN2ODcuOGMxOC44LTEwLjkgNDAuNy0xNy4xIDY0LTE3LjFoOTZjMzUuMyAwIDY0LTI4LjcgNjQtNjR2LTYuN0MzMDcuNyAxNDEgMjg4IDExMi44IDI4OCA4MGMwLTQ0LjIgMzUuOC04MCA4MC04MHM4MCAzNS44IDgwIDgwYzAgMzIuOC0xOS43IDYxLTQ4IDczLjNWMTYwYzAgNzAuNy01Ny4zIDEyOC0xMjggMTI4SDE3NmMtMzUuMyAwLTY0IDI4LjctNjQgNjR2Ni43YzI4LjMgMTIuMyA0OCA0MC41IDQ4IDczLjNjMCA0NC4yLTM1LjggODAtODAgODBzLTgwLTM1LjgtODAtODBjMC0zMi44IDE5LjctNjEgNDgtNzMuM1YzNTIgMTUzLjNDMTkuNyAxNDEgMCAxMTIuOCAwIDgwQzAgMzUuOCAzNS44IDAgODAgMHM4MCAzNS44IDgwIDgwem0yMzIgMGEyNCAyNCAwIDEgMCAtNDggMCAyNCAyNCAwIDEgMCA0OCAwek04MCA0NTZhMjQgMjQgMCAxIDAgMC00OCAyNCAyNCAwIDEgMCAwIDQ4eiIvPjwvc3ZnPg==";
    String iconFromSvg = "<path d=\"M218.71 73.85v0.06C137.14 76.36 71.46 187.32 71.46 " +
            "323.85s65.67 247.49 147.24 249.94v0.06h582.62v-500z\" fill=\"#DFEDFF\" /><path d=\"M808.82 " +
            "581.35H211.21v-0.55c-39.37-4.07-75.78-31.46-103.17-77.89C79.61 454.74 64 391.15 64 323.85S79.61 193 " +
            "108 144.79C135.42 98.36 171.83 71 211.21 66.9v-0.49l7.5-0.06h590.11z m-588.09-15h573.09v-485H220.77l-1.84 " +
            "0.06c-36.82 1.11-71.62 26.32-98 71C93.88 198.31 79 259.2 79 323.85s14.91 125.54 42 171.44c26.36 44.68 " +
            "61.16 69.9 98 71z m-2-492.44z\" fill=\"#66A9F7\" /><path d=\"M621.32 952.54a30 30 0 0 0 " +
            "30-30V336.31h151.14V73.85H219.84v0.06C138.27 76.36 72.6 187.32 72.6 323.85q0 6.27 0.19 " +
            "12.46h-0.19v586.23a30 30 0 0 0 30 30H411l63.65-142 45.13 113.41L553.31 851z\" fill=\"#FFFFFF\" />" +
            "<path d=\"M621.32 960a7.5 7.5 0 0 1-6.23-3.33l-60.56-90.41-28 60.75a7.5 7.5 0 0 " +
            "1-13.78-0.36l-38.57-96.93-56.4 125.84A7.5 7.5 0 0 1 411 960H102.6a37.54 37.54 0 0 1-37.5-37.5V336.31a7.53 " +
            "7.53 0 0 1 0.14-1.46c-0.1-3.7-0.14-7.39-0.14-11 0-67.3 15.65-130.89 44.07-179.06 28.83-48.9 67.7-76.68 " +
            "109.48-78.34a7.49 7.49 0 0 1 1.19-0.1h582.62a7.5 7.5 0 0 1 7.5 7.5v262.46a7.5 7.5 0 0 1-7.5 " +
            "7.5H658.82v578.73a37.54 37.54 0 0 1-37.5 37.46zM80.1 338v584.54A22.53 22.53 0 0 0 102.6 " +
            "945h303.51l61.66-137.59a7.5 7.5 0 0 1 13.81 0.29l38.67 97.16 26.25-57a7.5 7.5 0 0 1 13-1l65.57 97.88a22.54 " +
            "22.54 0 0 0 18.71-22.18V336.31a7.5 7.5 0 0 1 7.5-7.5H795V81.35H220.78q-0.35 0-0.71 0.06c-36.82 1.11-71.62 26.32-98 71-27.08 45.9-42 106.79-42 171.44 0 4 0.06 8.12 0.18 12.24a7.49 7.49 0 0 1-0.15 1.91z\" fill=\"#66A9F7\" /><path d=\"M651.32 323.85a150 250 0 1 0 300 0 150 250 0 1 0-300 0Z\" fill=\"#DFEDFF\" /><path d=\"M801.32 581.35c-42.8 0-82.76-27.3-112.5-76.86-29-48.37-45-112.52-45-180.64s16-132.27 45-180.64c29.74-49.57 69.69-76.86 112.5-76.86s82.76 27.3 112.5 76.86c29 48.37 45 112.52 45 180.64s-16 132.27-45 180.64c-29.74 49.56-69.69 76.86-112.5 76.86z m0-500c-37.33 0-72.71 24.71-99.63 69.58C674 197 658.82 258.42 658.82 323.85S674 450.7 701.69 496.77c26.92 44.87 62.31 69.58 99.63 69.58S874 541.64 901 496.77c27.64-46.07 42.87-107.48 42.87-172.92S928.6 197 901 150.93c-27-44.87-62.35-69.58-99.68-69.58z\" fill=\"#66A9F7\" /><path d=\"M755.15 323.85a46.17 76.94 0 1 0 92.34 0 46.17 76.94 0 1 0-92.34 0Z\" fill=\"#FFFFFF\" /><path d=\"M801.32 408.29c-30.09 0-53.67-37.09-53.67-84.44s23.57-84.44 53.67-84.44S855 276.5 855 323.85s-23.58 84.44-53.68 84.44z m0-153.88c-21 0-38.67 31.8-38.67 69.44s17.71 69.44 38.67 69.44S840 361.49 840 323.85s-17.72-69.44-38.68-69.44zM86.46 454.14h-15a2.5 2.5 0 1 1 0-5h15a2.5 2.5 0 0 1 0 5zM607.38 454.14h-28.94a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0h-28.94a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0h-28.94a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0H404.8a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0h-28.94a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0H289a2.5 2.5 0 0 1 0-5h29a2.5 2.5 0 0 1 0 5z m-57.88 0h-28.94a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0h-28.94a2.5 2.5 0 1 1 0-5h28.94a2.5 2.5 0 1 1 0 5z m-57.88 0H115.4a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5zM651.32 454.14h-15a2.5 2.5 0 0 1 0-5h15a2.5 2.5 0 0 1 0 5z\" fill=\"#66A9F7\" />"
    ;
    /*
    String iconFromSvg = "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n" +
            "<!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->\n" +
            "<svg width=\"800px\" height=\"800px\" viewBox=\"0 0 1024 1024\" class=\"icon\"  version=\"1.1\" " +
            "xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M218.71 73.85v0.06C137.14 76.36 71.46 187.32 71.46 " +
            "323.85s65.67 247.49 147.24 249.94v0.06h582.62v-500z\" fill=\"#DFEDFF\" /><path d=\"M808.82 " +
            "581.35H211.21v-0.55c-39.37-4.07-75.78-31.46-103.17-77.89C79.61 454.74 64 391.15 64 323.85S79.61 193 " +
            "108 144.79C135.42 98.36 171.83 71 211.21 66.9v-0.49l7.5-0.06h590.11z m-588.09-15h573.09v-485H220.77l-1.84 " +
            "0.06c-36.82 1.11-71.62 26.32-98 71C93.88 198.31 79 259.2 79 323.85s14.91 125.54 42 171.44c26.36 44.68 " +
            "61.16 69.9 98 71z m-2-492.44z\" fill=\"#66A9F7\" /><path d=\"M621.32 952.54a30 30 0 0 0 " +
            "30-30V336.31h151.14V73.85H219.84v0.06C138.27 76.36 72.6 187.32 72.6 323.85q0 6.27 0.19 " +
            "12.46h-0.19v586.23a30 30 0 0 0 30 30H411l63.65-142 45.13 113.41L553.31 851z\" fill=\"#FFFFFF\" />" +
            "<path d=\"M621.32 960a7.5 7.5 0 0 1-6.23-3.33l-60.56-90.41-28 60.75a7.5 7.5 0 0 " +
            "1-13.78-0.36l-38.57-96.93-56.4 125.84A7.5 7.5 0 0 1 411 960H102.6a37.54 37.54 0 0 1-37.5-37.5V336.31a7.53 " +
            "7.53 0 0 1 0.14-1.46c-0.1-3.7-0.14-7.39-0.14-11 0-67.3 15.65-130.89 44.07-179.06 28.83-48.9 67.7-76.68 " +
            "109.48-78.34a7.49 7.49 0 0 1 1.19-0.1h582.62a7.5 7.5 0 0 1 7.5 7.5v262.46a7.5 7.5 0 0 1-7.5 " +
            "7.5H658.82v578.73a37.54 37.54 0 0 1-37.5 37.46zM80.1 338v584.54A22.53 22.53 0 0 0 102.6 " +
            "945h303.51l61.66-137.59a7.5 7.5 0 0 1 13.81 0.29l38.67 97.16 26.25-57a7.5 7.5 0 0 1 13-1l65.57 97.88a22.54 " +
            "22.54 0 0 0 18.71-22.18V336.31a7.5 7.5 0 0 1 7.5-7.5H795V81.35H220.78q-0.35 0-0.71 0.06c-36.82 1.11-71.62 26.32-98 71-27.08 45.9-42 106.79-42 171.44 0 4 0.06 8.12 0.18 12.24a7.49 7.49 0 0 1-0.15 1.91z\" fill=\"#66A9F7\" /><path d=\"M651.32 323.85a150 250 0 1 0 300 0 150 250 0 1 0-300 0Z\" fill=\"#DFEDFF\" /><path d=\"M801.32 581.35c-42.8 0-82.76-27.3-112.5-76.86-29-48.37-45-112.52-45-180.64s16-132.27 45-180.64c29.74-49.57 69.69-76.86 112.5-76.86s82.76 27.3 112.5 76.86c29 48.37 45 112.52 45 180.64s-16 132.27-45 180.64c-29.74 49.56-69.69 76.86-112.5 76.86z m0-500c-37.33 0-72.71 24.71-99.63 69.58C674 197 658.82 258.42 658.82 323.85S674 450.7 701.69 496.77c26.92 44.87 62.31 69.58 99.63 69.58S874 541.64 901 496.77c27.64-46.07 42.87-107.48 42.87-172.92S928.6 197 901 150.93c-27-44.87-62.35-69.58-99.68-69.58z\" fill=\"#66A9F7\" /><path d=\"M755.15 323.85a46.17 76.94 0 1 0 92.34 0 46.17 76.94 0 1 0-92.34 0Z\" fill=\"#FFFFFF\" /><path d=\"M801.32 408.29c-30.09 0-53.67-37.09-53.67-84.44s23.57-84.44 53.67-84.44S855 276.5 855 323.85s-23.58 84.44-53.68 84.44z m0-153.88c-21 0-38.67 31.8-38.67 69.44s17.71 69.44 38.67 69.44S840 361.49 840 323.85s-17.72-69.44-38.68-69.44zM86.46 454.14h-15a2.5 2.5 0 1 1 0-5h15a2.5 2.5 0 0 1 0 5zM607.38 454.14h-28.94a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0h-28.94a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0h-28.94a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0H404.8a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0h-28.94a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0H289a2.5 2.5 0 0 1 0-5h29a2.5 2.5 0 0 1 0 5z m-57.88 0h-28.94a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5z m-57.88 0h-28.94a2.5 2.5 0 1 1 0-5h28.94a2.5 2.5 0 1 1 0 5z m-57.88 0H115.4a2.5 2.5 0 0 1 0-5h28.94a2.5 2.5 0 0 1 0 5zM651.32 454.14h-15a2.5 2.5 0 0 1 0-5h15a2.5 2.5 0 0 1 0 5z\" fill=\"#66A9F7\" /></svg>"
            ;
*/

    @ReadOnly
    String assessment;

    @Action(visible = false)
    void changeIcon() {
        icon = chooseIcon.getIcon();
    }


    @Action
    void assess() {
        assessment = "It works!";
    }

}
