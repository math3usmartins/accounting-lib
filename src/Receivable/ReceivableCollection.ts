import { type Receivable } from "../Receivable"
import { type Payment } from "../Payment"
import { ReceivablePayment } from "./Payment/ReceivablePayment"
import { Mutation } from "../Mutation"
import { type CustomerAccountId } from "../CustomerAccount/CustomerAccountId"
import { type PaymentAllocatedToReceivable } from "./Event/PaymentAllocatedToReceivable"
import { type Timestamp } from "../Timestamp"

import * as fp from "fp-ts/function"
import { type Money } from "../Money"
import * as Option from "fp-ts/lib/Option"
import { type Option as TOption } from "fp-ts/lib/Option"
import { type PaymentId } from "../Payment/PaymentId"

type DistributePaymentOutput<Type> = Mutation<
	ReceivableCollection<Type>,
	PaymentAllocatedToReceivable
>

type Items<Type> = Array<Receivable<Type>>

class PaymentDistribution<R> {
	constructor(
		public readonly amountAvailable: Money,
		public readonly collection: ReceivableCollection<R>,
		public readonly events: PaymentAllocatedToReceivable[],
	) {}
}

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

	public contains = (item: Receivable<Type>): boolean =>
		fp.pipe(
			this.items.findIndex((v) => v.id.isEqualTo(item.id)),
			(index) => index >= 0,
		)

	public with = (item: Receivable<Type>): ReceivableCollection<Type> =>
		new ReceivableCollection(this.customerAccountId, [...this.items, item])

	public distributePayment(
		payment: Payment,
		dateTime: Timestamp,
	): DistributePaymentOutput<Type> {
		const distribution = this.items.reduce(
			(distribution, current) => {
				return fp.pipe(
					this.applicableAmountForReceivable(
						distribution.amountAvailable,
						current,
					),
					Option.map((applicableAmount) =>
						fp.pipe(
							this.allocatePaymentToReceivable(
								payment.id,
								dateTime,
								applicableAmount,
								current,
							),
							(allocation) =>
								fp.pipe(
									allocation.events.map((e) => e.amount),
									(amounts) =>
										amounts.reduce(
											(remaining, current) =>
												remaining.subtract(
													current.cents,
												),
											distribution.amountAvailable,
										),
									(remaining) =>
										new PaymentDistribution(
											remaining,
											distribution.collection.with(
												allocation.mutant as Receivable<Type>,
											),
											[
												...distribution.events,
												...allocation.events,
											],
										),
								),
						),
					),
					Option.getOrElse(
						() =>
							new PaymentDistribution(
								distribution.amountAvailable,
								distribution.collection.with(current),
								distribution.events,
							),
					),
				)
			},
			new PaymentDistribution(
				payment.amount,
				new ReceivableCollection<Type>(this.customerAccountId, []),
				[],
			),
		)

		return new Mutation(distribution.collection, distribution.events)
	}

	private readonly applicableAmountForReceivable = (
		amountAvailable: Money,
		receivable: Receivable<Type>,
	): TOption<Money> =>
		fp.pipe(amountAvailable.deductible(receivable.amount), (deductible) =>
			deductible.cents <= 0 ? Option.none : Option.some(deductible),
		)

	private readonly allocatePaymentToReceivable = (
		paymentId: PaymentId,
		dateTime: Timestamp,
		deductible: Money,
		receivable: Receivable<Type>,
	): Mutation<Type, PaymentAllocatedToReceivable> =>
		receivable.allocatePayment(
			new ReceivablePayment(dateTime, paymentId, deductible),
		)
}
