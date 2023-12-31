import { Timestamp } from "../../Timestamp"
import { type CustomerAccountEvent } from "../CustomerAccountEvent"
import { type CustomerAccountId } from "../CustomerAccountId"

export class CustomerAccountCreated implements CustomerAccountEvent {
	constructor(
		public readonly customerAccountId: CustomerAccountId,
		public readonly dateTime: Timestamp,
	) {}
}
