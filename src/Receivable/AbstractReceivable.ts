import { type Timestamp } from "../Timestamp"
import { type ReceivableId } from "./ReceivableId"
import { type CustomerAccountId } from "../CustomerAccount/CustomerAccountId"
import { type Receivable } from "../Receivable"
import { type ReceivablePaymentCollection } from "./Payment/ReceivablePaymentCollection"
import { type Money } from "../Money"
import { type ReceivablePayment } from "./Payment/ReceivablePayment"
import { type AggregateCommandOutput } from "../AggregateCommandOutput"
import { type PaymentAllocatedToReceivable } from "./Event/PaymentAllocatedToReceivable"

export abstract class AbstractReceivable<Type> implements Receivable<Type> {
	public abstract allocatePayment(
		payment: ReceivablePayment,
	): AggregateCommandOutput<Type, PaymentAllocatedToReceivable>

	constructor(
		public readonly dateTime: Timestamp,
		public readonly id: ReceivableId,
		public readonly customerAccountId: CustomerAccountId,
		public readonly amount: Money,
		public readonly payments: ReceivablePaymentCollection,
		protected readonly _isWrittenOff: boolean,
	) {}

	// IMPORTANT: written-off is NOT paid despite any payment amount.
	public isPaid = (): boolean =>
		!this._isWrittenOff && this.payments.total() >= this.amount.cents

	public isWrittenOff = (): boolean => this._isWrittenOff

	// IMPORTANT: this may INTENTIONALLY return negative values (overpayment)
	public pendingAmount = (): Money =>
		this.amount.subtract(this.payments.total())
}
