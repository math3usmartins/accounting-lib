import { type PaymentReceivable } from "./PaymentReceivable"

export class PaymentReceivableCollection {
	constructor(public readonly items: PaymentReceivable[]) {}

	public with(receivable: PaymentReceivable): PaymentReceivableCollection {
		return new PaymentReceivableCollection([...this.items, receivable])
	}

	public total = (): number =>
		this.items.reduce((sum: number, current: PaymentReceivable) => sum + current.amount.cents, 0)
}
