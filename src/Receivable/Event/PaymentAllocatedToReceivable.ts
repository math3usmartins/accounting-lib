import { type PaymentId } from "../../Payment/PaymentId"
import { type ReceivableId } from "../ReceivableId"
import { type Timestamp } from "../../Timestamp"
import { type CustomerAccountId } from "../../CustomerAccount/CustomerAccountId"
import { type CustomerAccountEvent } from "../../CustomerAccount/CustomerAccountEvent"
import { type Money } from "../../Money"

export class PaymentAllocatedToReceivable implements CustomerAccountEvent {
	constructor(
		public readonly dateTime: Timestamp,
		public readonly paymentId: PaymentId,
		public readonly receivableId: ReceivableId,
		public readonly customerAccountId: CustomerAccountId,
		public readonly amount: Money,
	) {}
}
