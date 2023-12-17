import { type Money } from "./Money"
import { type PaymentId } from "./Payment/PaymentId"
import { type Timestamp } from "./Timestamp"

export class Payment {
	constructor(
		public readonly id: PaymentId,
		public readonly dateTime: Timestamp,
		public readonly amount: Money,
	) {}
}
