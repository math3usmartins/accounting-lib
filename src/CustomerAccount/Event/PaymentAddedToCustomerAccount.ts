import { type Payment } from "../../Payment"
import { type CustomerAccountId } from "../CustomerAccountId"
import { type Timestamp } from "../../Timestamp"
import { type CustomerAccountEvent } from "../CustomerAccountEvent"

export class PaymentAddedToCustomerAccount implements CustomerAccountEvent {
	constructor(
		public readonly payment: Payment,
		public readonly customerAccountId: CustomerAccountId,
		public readonly dateTime: Timestamp,
	) {}
}
