import { Mutation } from "../Mutation"
import { AbstractReceivable } from "./AbstractReceivable"
import { PaymentAllocatedToReceivable } from "./Event/PaymentAllocatedToReceivable"
import { type ReceivablePayment } from "./Payment/ReceivablePayment"

export class Invoice extends AbstractReceivable<Invoice> {
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
}
