# The Python twin (mateu-ui): Signature(), PhotoCapture() and FileUpload() store data URIs too.
from typing import Annotated

from mateu_ui.uidl import FileUpload, Message, PhotoCapture, Signature, button, title, ui


@ui("delivery-proof")
@title("Proof of delivery")
class DeliveryProof:
    received_by: str = ""
    signature: Annotated[str, Signature()] = ""
    photo: Annotated[str, PhotoCapture()] = ""
    datasheet: Annotated[str, FileUpload()] = ""

    @button()
    def confirm(self) -> Message:
        return Message(f"Signature: {len(self.signature) // 1024} KB · photo: {len(self.photo) // 1024} KB")
