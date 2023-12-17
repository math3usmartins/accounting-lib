import { type Money } from "./Money"
import { InsufficientAmountError } from "./Payment/Error/InsufficientAmountError"
import { type PaymentId } from "./Payment/PaymentId"
import { type PaymentReceivable } from "./Payment/Receivable/PaymentReceivable"
import { type PaymentReceivableCollection } from "./Payment/Receivable/PaymentReceivableCollection"
import { type Timestamp } from "./Timestamp"

export class Payment {
	constructor(
		public readonly id: PaymentId,
		public readonly dateTime: Timestamp,
		public readonly amount: Money,
		private readonly receivables: PaymentReceivableCollection,
	) {}

	public availableAmount = (): Money => this.amount.subtract(this.receivables.total())

	public withReceivable(receivable: PaymentReceivable): Payment {
		if (this.availableAmount().cents < receivable.amount.cents) {
			throw new InsufficientAmountError(receivable)
		}

		return new Payment(
			this.id,
			this.dateTime,
			this.amount,
			this.receivables.with(receivable),
		)
	}
}
