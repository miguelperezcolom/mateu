import Message from "./Message";
import ViewPart from "./ViewPart";

export default interface View {

    title: string

    subtitle: string

    messages: Message[]

    header: ViewPart

    left: ViewPart

    main: ViewPart

    right: ViewPart

    footer: ViewPart

}
