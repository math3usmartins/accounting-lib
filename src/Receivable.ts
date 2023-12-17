import { type ReceivableId } from "./Receivable/ReceivableId"
import { type CustomerAccountId } from "./CustomerAccount/CustomerAccountId"
import { type Timestamp } from "./Timestamp"
import { type ReceivablePaymentCollection } from "./Receivable/Payment/ReceivablePaymentCollection"
import { type Money } from "./Money"
import { type ReceivablePayment } from "./Receivable/Payment/ReceivablePayment"
import { type AggregateCommandOutput } from "./AggregateCommandOutput"
import { type PaymentAllocatedToReceivable } from "./Receivable/Event/PaymentAllocatedToReceivable"

export interface Receivable<Type> {
	id: ReceivableId
	dateTime: Timestamp
	customerAccountId: CustomerAccountId
	amount: Money
	payments: ReceivablePaymentCollection
	isPaid: () => boolean
	isWrittenOff: () => boolean
	pendingAmount: () => Money
	allocatePayment: (
		payment: ReceivablePayment,
	) => AggregateCommandOutput<Type, PaymentAllocatedToReceivable>
}
