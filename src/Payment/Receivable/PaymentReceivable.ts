import { type Money } from "../../Money"
import { type ReceivableId } from "../../Receivable/ReceivableId"
import { type Timestamp } from "../../Timestamp"

export class PaymentReceivable {
	constructor(
		public readonly dateTime: Timestamp,
		public readonly receivableId: ReceivableId,
		public readonly amount: Money,
	) {}
}
