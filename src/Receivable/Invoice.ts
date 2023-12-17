import { AggregateCommandOutput } from "../AggregateCommandOutput"
import { AbstractReceivable } from "./AbstractReceivable"
import { PaymentAllocatedToReceivable } from "./Event/PaymentAllocatedToReceivable"
import { type ReceivablePayment } from "./Payment/ReceivablePayment"

export class Invoice extends AbstractReceivable<Invoice> {
	public allocatePayment(
		payment: ReceivablePayment,
	): AggregateCommandOutput<Invoice, PaymentAllocatedToReceivable> {
		return new AggregateCommandOutput(
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
