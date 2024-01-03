import { type Timestamp } from "../../Timestamp"
import { type ReceivableId } from "../ReceivableId"

export interface ReceivableEvent {
	receivableId: ReceivableId
	dateTime: Timestamp
}
