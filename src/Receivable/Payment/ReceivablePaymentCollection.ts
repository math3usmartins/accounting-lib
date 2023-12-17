import { type ReceivableId } from "../ReceivableId"
import { type ReceivablePayment } from "./ReceivablePayment"

export class ReceivablePaymentCollection {
	constructor(
		public receivableId: ReceivableId,
		public readonly items: ReceivablePayment[],
	) {}

	public with = (item: ReceivablePayment): ReceivablePaymentCollection =>
		new ReceivablePaymentCollection(this.receivableId, [
			...this.items,
			item,
		])

	public total = (): number =>
		this.items.reduce(
			(carry: number, payment: ReceivablePayment) =>
				carry + payment.amount.cents,
			0,
		)
}
