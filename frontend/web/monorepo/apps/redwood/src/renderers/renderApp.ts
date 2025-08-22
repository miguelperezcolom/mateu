import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, LitElement, nothing, TemplateResult } from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
//import '../../public/js/libs/oj/19.0.0/min/ojarraytreedataprovider.js'



export const renderApp = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any): TemplateResult => {
    const metadata = component.metadata as App

    const opened = data.opened??false;

    console.log('opened', opened)

    const open = (e:Event) => {
        data.opened = !data.opened;
        container.requestUpdate()
    }

    const close = (e:Event) => {
        data.opened = false;
        container.requestUpdate()
    }

    return html`
        <div id="componentDemoContent">

            <div id="demo-container">
                <header id="header" role="banner" class="oj-flex-bar oj-web-applayout-header oj-sm-align-items-center"> <!-- Header: Main -->
                    <div class="oj-flex-bar oj-sm-flex-1 oj-sm-align-items-center oj-sm-only-width-full oj-sm-only-padding-0-end oj-sm-only-padding-0-start">
                        <div class="oj-flex-bar-start">
                            <div class="oj-sm-only-hide oj-flex oj-sm-align-items-center">
                                <oj-button id="toggleNavListButton"
                                           class="toggleNavListButton oj-lg-hide oj-button oj-button-half-chrome oj-button-icon-only oj-enabled oj-default oj-complete"
                                           chroming="half" display="icons" @ojAction="${open}"
                                           title="Cookbook navigation">
                                    <button aria-labelledby="toggleNavListButton_oj0|text" class="oj-button-button">
                                        <div class="oj-button-label"><span class="oj-button-icon oj-start"><span
                                                slot="startIcon" title="Cookbook Navigation"
                                                class="oj-ux-ico-menu"></span></span><span
                                                id="toggleNavListButton_oj0|text"
                                                class="oj-button-text oj-helper-hidden-accessible">
    Cookbook navigation
  </span></div>
                                    </button>
                                </oj-button>

                                <div id="togglePinnedNavListButtonDiv"
                                     class="togglePinnedNavListButtonSet oj-sm-only-hide oj-md-only-hide">
                                    <oj-button chroming="borderless" id="borderlessPushIcon"
                                               @ojAction="${open}" display="icons"
                                               class="oj-button oj-button-half-chrome oj-button-icon-only oj-enabled oj-complete oj-default"
                                               title="Cookbook navigation">
                                        <button aria-labelledby="borderlessPushIcon_oj1|text" class="oj-button-button">
                                            <div class="oj-button-label"><span class="oj-button-icon oj-start"><span
                                                    slot="startIcon" class="oj-ux-ico-menu"></span></span><span
                                                    id="borderlessPushIcon_oj1|text"
                                                    class="oj-button-text oj-helper-hidden-accessible">
         Cookbook navigation
      </span></div>
                                        </button>
                                    </oj-button>
                                </div>

                                <span class="oj-sm-only-hide oj-flex-item"><img alt="Oracle JET icon"
                                                                                src="/images/JET-icon.png"
                                                                                width="24" height="24"></span>
                                <span class=" oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-padding-2x-start">${metadata.title}</span>

                            </div>
                        </div>
                        <div 
                             class="oj-flex-bar-end  oj-sm-align-items-center oj-sm-only-width-full">
                            <div class="oj-flex-item oj-sm-padding-2x-end">
                                <oj-button title="JET Website Home" chroming="borderless"
                                            display="icons"
                                           class="oj-button oj-button-half-chrome oj-button-icon-only oj-enabled oj-complete oj-default">
                                    <button class="oj-button-button">
                                        <div class="oj-button-label"><span class="oj-button-icon oj-start"><span
                                                slot="startIcon" class="oj-ux-ico-home"></span></span><span></span>
                                        </div>
                                    </button>
                                </oj-button>
                            </div>

                        </div>
                    </div>
                </header>
                <div class="demo-header demo-padding oj-bg-neutral-0 oj-divider-bottom">
                    <div>
                        <oj-c-button id="buttonOpener" display="icons" @ojAction="${open}" label="Start">
                            <span slot="startIcon" class="oj-ux-ico-menu"></span>
                        </oj-c-button>
                    </div>
                    <span class=" oj-flex-item oj-typography-body-md oj-typography-bold oj-sm-padding-2x-start">${metadata.title}</span>
                    <oj-c-avatar
                            aria-label="JD"
                            initials="JD"
                            background="green"
                            title="JD"
                            size="sm"
                            shape="circle">
                    </oj-c-avatar>
                </div>
                <oj-c-drawer-layout start-opened="${opened}" class="demo-full-height">
                    
                    <div class="demo-padding">
                        <!--
                        <div class="demo-controls">
                            <oj-c-button id="buttonOpener" display="icons" @ojAction="${open}" label="Start">
                                <span slot="startIcon" class="oj-ux-ico-menu"></span>
                            </oj-c-button>${metadata.title}
                        </div>
                        -->
                        <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                            labore et dolore magna aliqua. Venenatis a condimentum vitae sapien pellentesque habitant
                            morbi tristique senectus. Hendrerit dolor magna eget est lorem ipsum dolor sit. Volutpat
                            consequat mauris nunc congue nisi vitae. Parturient montes nascetur ridiculus mus mauris
                            vitae ultricies. Fermentum leo vel orci porta non pulvinar neque laoreet.
                        </p>
                        <p>
                            Non arcu risus quis varius quam quisque. In metus vulputate eu scelerisque felis imperdiet
                            proin fermentum leo. Pretium viverra suspendisse potenti nullam ac tortor vitae. Bibendum
                            arcu vitae elementum curabitur. Fermentum leo vel orci porta. Nisl vel pretium lectus quam
                            id leo in. Lorem ipsum dolor sit amet consectetur. Orci sagittis eu volutpat odio facilisis
                            mauris sit. Risus nullam eget felis eget nunc lobortis mattis aliquam faucibus.
                        </p>
                        <p>
                            Pellentesque dignissim ac orci a elementum. Morbi at venenatis nisl. Lorem ipsum dolor sit
                            amet, consectetur adipiscing elit. Nulla enim magna, mattis sit amet arcu molestie,
                            fermentum pellentesque enim. Vivamus commodo est eget justo pharetra convallis. Phasellus
                            hendrerit elementum ipsum, sit amet dignissim risus lacinia fringilla. Aenean non diam
                            nulla. Maecenas imperdiet lacus accumsan venenatis tempus. Aliquam vulputate facilisis
                            tellus bibendum vestibulum.
                        </p>
                        <p>
                            Sed at odio luctus, tempus felis quis, hendrerit justo. Aliquam varius congue massa id
                            fringilla. In consectetur urna et accumsan ornare. Quisque consequat consequat lorem, et
                            euismod metus faucibus vitae. Sed sit amet risus a leo aliquet imperdiet. Cras pulvinar
                            consequat feugiat. Proin tristique congue dignissim. Phasellus in erat ultrices, mollis orci
                            in, consectetur arcu.
                        </p>
                    </div>
                    <div slot="start" class="demo-drawer-start" id="demo-drawer-start">
                        <!--
                        <div class="demo-drawer-header" style="display: flex; padding: 0.3rem 1rem 0 1rem; justify-content: space-between; align-items: center;">
                            <div>
                                <h6>${metadata.title}</h6>
                            </div>
                            <oj-c-button
                                    id="buttonCloser"
                                    display="icons"
                                    chroming="borderless"
                                    @ojAction="${close}"
                                    label="Close">
                                <span slot="startIcon" class="oj-ux-ico-close"></span>
                            </oj-c-button>
                        </div>
                        -->
                        <oj-navigation-list aria-label="Choose a navigation item"
                        drill-mode="sliding"
                            @ojSelectionAction="${(e) => console.log(e)}"
                                            root-label="Welcome"
                        >
                            <ul>
                                ${metadata.menu.map(menu => html`
                                    <li><a href="#">${menu.label}</a>
                                        ${menu.submenus?html`
                                        <ul>
                                            ${menu.submenus.map(sub => html`
                                                <li><a href="#">${sub.label}</a></li>
                                            `)}
                                        </ul>
                                        `:nothing}
                                    </li>
                                `)}
                            </ul>
                        </oj-navigation-list>
                    </div>
                </oj-c-drawer-layout>
            </div>



        </div>`

    return html`<h1>Hola</h1>
    <hr>
    <div class="oj-bg-neutral-170 oj-color-invert" style="max-width: 15rem;">
        <oj-navigation-list
                aria-label="Choose a navigation item"
                drill-mode="sliding"
                @ojSelectionAction="${(e) => console.log(e)}"
                root-label="Hola"
        >
            <ul>
                <li><a href="#">Item 1</a></li>
                <li><a href="#"><!--<span class="oj-navigationlist-item-icon demo-icon-font-24 demo-palette-icon-24"></span>--> Item 2</a></li>
                <li class="oj-navigationlist-category-divider"></li>
                <li><a href="#"><span class="oj-navigationlist-item-label">
        Foo
        </span></a></li>
                <li><a href="#">Item 3</a>
                    <ul>
                        <li><a href="#">Item 3-1</a></li>
                        <li><a href="#">Item 3-2</a></li>
                        <li><a href="#">Item 3-3</a></li>
                        <li><a href="#">Item 3-4</a></li>
                        <li><a href="#">Item 3-5</a></li>
                    </ul>
                </li>
            </ul>
        </oj-navigation-list>
    </div>
    <hr>
    
    `

}