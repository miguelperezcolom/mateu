import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import Message from "@mateu/shared/apiClients/dtos/Message.ts";
import UICommand from "@mateu/shared/apiClients/dtos/UICommand.ts";
import { Banner } from "@mateu/shared/apiClients/dtos/componentmetadata/Banner.ts";

export default interface UIIncrement {

    /** Wire protocol version of the payload ("3.0"); checked by infra/http/wireVersion. */
    wireVersion?: string

    messages: Message[] | undefined
    commands: UICommand[] | undefined
    fragments: UIFragment[] | undefined
    banners: Banner[] | undefined
    appendBanners: boolean | undefined
    appData: Record<string, any> | undefined
    appState: Record<string, any> | undefined

}
