import { type Either as TEither } from "fp-ts/lib/Either"
import * as Either from "fp-ts/lib/Either"
import * as Option from "fp-ts/lib/Option"
import * as fp from "fp-ts/function"

import { Mutation } from "../Mutation"
import { AbstractReceivable } from "./AbstractReceivable"
import { PaymentAllocatedToReceivable } from "./Event/PaymentAllocatedToReceivable"
import { type ReceivableEvent } from "./Event/ReceivableEvent"
import { type ReceivablePayment } from "./Payment/ReceivablePayment"
import { ReceivableCreated } from "./Event/ReceivableCreated"
import { type ReceivableId } from "./ReceivableId"
import { type Money } from "../Money"
import { type Timestamp } from "../Timestamp"
import { type CustomerAccountId } from "../CustomerAccount/CustomerAccountId"
import { ReceivablePaymentCollection } from "./Payment/ReceivablePaymentCollection"

export class Invoice extends AbstractReceivable<Invoice> {
	public static initial = (
		dateTime: Timestamp,
		id: ReceivableId,
		customerAccountId: CustomerAccountId,
		amount: Money,
	): Invoice =>
		new Invoice(
			dateTime,
			id,
			customerAccountId,
			amount,
			new ReceivablePaymentCollection(id, []),
			false,
		)

	public allocatePayment(
		payment: ReceivablePayment,
	): Mutation<Invoice, PaymentAllocatedToReceivable> {
		return new Mutation(
			new Invoice(
				this.dateTime,
				this.id,
				this.customerAccountId,
				this.amount,
				this.payments.with(payment),
				this._isWrittenOff,
			),
			[
				new PaymentAllocatedToReceivable(
					payment.dateTime,
					payment.paymentId,
					this.id,
					this.customerAccountId,
					payment.amount,
				),
			],
		)
	}

	public onEvent = (event: ReceivableEvent): TEither<Error, Invoice> =>
		fp.pipe(
			event,
			Option.fromPredicate(
				(event) =>
					event instanceof ReceivableCreated &&
					event.receivable instanceof Invoice,
			),
			Option.map((event) => event as ReceivableCreated<Invoice>),
			Option.map((event) => event.receivable as Invoice),
			Either.fromOption(
				() =>
					new Error(`Event not supported: ${event.constructor.name}`),
			),
		)
}
