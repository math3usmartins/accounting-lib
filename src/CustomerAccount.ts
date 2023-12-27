import { type CustomerAccountId } from "./CustomerAccount/CustomerAccountId"
import { ReceivableCollection } from "./Receivable/ReceivableCollection"
import { type Receivable } from "./Receivable"
import { type Payment } from "./Payment"
import { type Timestamp } from "./Timestamp"
import { PaymentCollection } from "./Payment/PaymentCollection"
import { Mutation } from "./Mutation"
import { PaymentAddedToCustomerAccount } from "./CustomerAccount/Event/PaymentAddedToCustomerAccount"
import { ReceivableAddedToCustomerAccount } from "./CustomerAccount/Event/ReceivableAddedToCustomerAccount"
import { type CustomerAccountEvent } from "./CustomerAccount/CustomerAccountEvent"
import { type Invoice } from "./Receivable/Invoice"
import { CustomerAccountVersion } from "./CustomerAccount/CustomerAccountVersion"
import { ReceivableAlreadyAllocatedError } from "./CustomerAccount/Error/ReceivableAlreadyAllocatedError"

import * as fp from "fp-ts/function"
import * as Either from "fp-ts/lib/Either"
import { Either as TEither } from "fp-ts/lib/Either"
import { onReceivableAddedToCustomerAccount } from "./CustomerAccount/CustomerAccountListener"

export type CustomerAccountMutation = Mutation<
	CustomerAccount,
	CustomerAccountEvent
>

interface ICustomerAccount {
	allocateReceivable(
		receivable: Receivable<Invoice>,
		dateTime: Timestamp,
	): TEither<ReceivableAlreadyAllocatedError, CustomerAccountMutation>

	allocatePayment(
		payment: Payment,
		dateTime: Timestamp,
	): TEither<Error, CustomerAccountMutation>
}

export class CustomerAccount implements ICustomerAccount {
	constructor(
		public readonly id: CustomerAccountId,
		public readonly version: CustomerAccountVersion,
		public readonly receivables: ReceivableCollection<Invoice>,
		public readonly payments: PaymentCollection,
	) {}

	public static initial(id: CustomerAccountId): CustomerAccount {
		return new CustomerAccount(
			id,
			new CustomerAccountVersion(1),
			new ReceivableCollection(id, []),
			new PaymentCollection([]),
		)
	}

	public allocateReceivable = (
		receivable: Receivable<Invoice>,
		dateTime: Timestamp,
	): TEither<ReceivableAlreadyAllocatedError, CustomerAccountMutation> =>
		fp.pipe(
			this.receivables,
			Either.fromPredicate(
				(receivables) => !receivables.contains(receivable),
				() => ReceivableAlreadyAllocatedError.fromInvoice(receivable),
			),
			Either.map(
				() =>
					new ReceivableAddedToCustomerAccount(
						receivable,
						this.id,
						dateTime,
					),
			),
			Either.map((event) =>
				fp.pipe(
					onReceivableAddedToCustomerAccount(this, event),
					(mutation) =>
						new Mutation(mutation.mutant, [
							event,
							...mutation.events,
						]),
				),
			),
		)

	public allocatePayment = (
		payment: Payment,
		dateTime: Timestamp,
	): TEither<Error, CustomerAccountMutation> =>
		fp.pipe(
			this.payments.with(payment),
			Either.map((payments) =>
				fp.pipe(
					this.receivables.distributePayment(payment, dateTime),
					(receivablesMutation) =>
						new Mutation(
							new CustomerAccount(
								this.id,
								this.version.next(),
								receivablesMutation.mutant,
								payments,
							),
							[
								new PaymentAddedToCustomerAccount(
									payment,
									this.id,
									payment.dateTime,
								),
								...receivablesMutation.events,
							],
						),
				),
			),
		)

	public allocateAvailablePayments(
		dateTime: Timestamp,
	): CustomerAccountMutation {
		return this.payments
			.items()
			.reduce(
				(carry: CustomerAccountMutation, payment: Payment) =>
					fp.pipe(
						carry.mutant.receivables.distributePayment(
							payment,
							dateTime,
						),
						(distribution) =>
							new Mutation(
								new CustomerAccount(
									this.id,
									this.version,
									distribution.mutant,
									this.payments,
								),
								[...carry.events, ...distribution.events],
							),
					),
				new Mutation(this, []),
			)
	}
}
