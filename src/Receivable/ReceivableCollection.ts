import { type Receivable } from "../Receivable"
import { type Payment } from "../Payment"
import { ReceivablePayment } from "./Payment/ReceivablePayment"
import { AggregateCommandOutput } from "../AggregateCommandOutput"
import { type CustomerAccountId } from "../CustomerAccount/CustomerAccountId"
import { type PaymentAllocatedToReceivable } from "./Event/PaymentAllocatedToReceivable"
import { type Timestamp } from "../Timestamp"

type AllocatePaymentOutput<Type> = AggregateCommandOutput<
	ReceivableCollection<Type>,
	PaymentAllocatedToReceivable
>

type Items<Type> = Array<Receivable<Type>>

export class ReceivableCollection<Type> {
	private readonly _items: Items<Type> = []

	constructor(
		private readonly customerAccountId: CustomerAccountId,
		items: Items<Type>,
	) {
		this._items = items.sort((a, b) =>
			a.dateTime.isEqualTo(b.dateTime)
				? 0
				: a.dateTime.isEarlierThan(b.dateTime)
					? -1
					: 1,
		)
	}

	public contains(item: Receivable<Type>): boolean {
		const alreadyExistingIndex = this._items.findIndex((v) =>
			v.id.equals(item.id),
		)

		return alreadyExistingIndex >= 0
	}

	public with(item: Receivable<Type>): ReceivableCollection<Type> {
		if (this.contains(item)) {
			throw new Error(`Receivable ID ${item.id.value} was already found`)
		}

		return new ReceivableCollection(this.customerAccountId, [
			...this._items,
			item,
		])
	}

	public allocatePayment(
		payment: Payment,
		dateTime: Timestamp,
	): AllocatePaymentOutput<Type> {
		let remainingAmount = payment.amount
		const events: PaymentAllocatedToReceivable[] = []

		const receivables: Items<Type> = this._items.map(
			(receivable: Receivable<Type>) => {
				const deductible = remainingAmount.deductible(receivable.amount)

				if (deductible.cents <= 0) {
					// this receivable can NOT receive this payment,
					// return it without changes
					return receivable
				}

				remainingAmount = remainingAmount.subtract(deductible.cents)

				const allocatePaymentOutput = receivable.allocatePayment(
					new ReceivablePayment(dateTime, payment.id, deductible),
				)

				events.push(...allocatePaymentOutput.events)

				return allocatePaymentOutput.aggregate as Receivable<Type>
			},
		)

		return new AggregateCommandOutput(
			new ReceivableCollection(this.customerAccountId, receivables),
			events,
		)
	}
}
