import { type Timestamp } from "../Timestamp"
import { type CustomerAccountId } from "./CustomerAccountId"

export interface CustomerAccountEvent {
	customerAccountId: CustomerAccountId
	dateTime: Timestamp
}
