import { type PaymentReceivable } from "../Receivable/PaymentReceivable"

export class InsufficientAmountError extends Error {
	constructor(private readonly paymentReceilable: PaymentReceivable) {
		super()
	}
}
