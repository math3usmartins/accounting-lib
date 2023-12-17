import { type Timestamp } from "../../Timestamp"
import { type PaymentId } from "../../Payment/PaymentId"
import { type Money } from "../../Money"

export class ReceivablePayment {
	constructor(
		public readonly dateTime: Timestamp,
		public readonly paymentId: PaymentId,
		public readonly amount: Money,
	) {}
}
