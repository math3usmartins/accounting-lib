import type { PaymentId } from "../PaymentId"

export class PaymentAlreadyFoundError extends Error {
	public constructor(public readonly paymentId: PaymentId) {
		super(
			`Payment ID ${paymentId.value} already found in PaymentCollection`,
		)
	}
}
