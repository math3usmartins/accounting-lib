import { type Receivable } from "../Receivable"
import { type Payment } from "../Payment"
import { ReceivablePayment } from "./Payment/ReceivablePayment"
import { Mutation } from "../Mutation"
import { type CustomerAccountId } from "../CustomerAccount/CustomerAccountId"
import { type PaymentAllocatedToReceivable } from "./Event/PaymentAllocatedToReceivable"
import { type Timestamp } from "../Timestamp"

type AllocatePaymentMutation<Type> = Mutation<
	ReceivableCollection<Type>,
	PaymentAllocatedToReceivable
>

type Items<Type> = Array<Receivable<Type>>

export class ReceivableCollection<Type> {
	private readonly items: Items<Type> = []

	constructor(
		private readonly customerAccountId: CustomerAccountId,
		items: Items<Type>,
	) {
		this.items = items.sort((a, b) =>
			a.dateTime.isEqualTo(b.dateTime)
				? 0
				: a.dateTime.isEarlierThan(b.dateTime)
					? -1
					: 1,
		)
	}

	public contains(item: Receivable<Type>): boolean {
		const alreadyExistingIndex = this.items.findIndex((v) =>
			v.id.isEqualTo(item.id),
		)

		return alreadyExistingIndex >= 0
	}

	public with(item: Receivable<Type>): ReceivableCollection<Type> {
		return new ReceivableCollection(this.customerAccountId, [
			...this.items,
			item,
		])
	}

	public allocatePayment(
		payment: Payment,
		dateTime: Timestamp,
	): AllocatePaymentMutation<Type> {
		let remainingAmount = payment.amount
		const events: PaymentAllocatedToReceivable[] = []

		const receivables: Items<Type> = this.items.map(
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

				return allocatePaymentOutput.mutant as Receivable<Type>
			},
		)

		return new Mutation(
			new ReceivableCollection(this.customerAccountId, receivables),
			events,
		)
	}
}
