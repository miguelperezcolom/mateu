import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import Card from "@mateu/shared/apiClients/dtos/componentmetadata/Card";

export default interface TableCrud extends Crud {

    card: Card

}