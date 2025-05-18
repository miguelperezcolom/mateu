import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";

export default interface UI {

    title: string | undefined
    favIcon: string | undefined
    homeRoute: string | undefined

    home: UIIncrement | undefined

}
