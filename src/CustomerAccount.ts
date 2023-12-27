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

export type CustomerAccountMutation = Mutation<
	CustomerAccount,
	CustomerAccountEvent
>

export class CustomerAccount {
	constructor(
		public readonly id: CustomerAccountId,
		private readonly version: CustomerAccountVersion,
		private readonly receivables: ReceivableCollection<Invoice>,
		private readonly payments: PaymentCollection,
	) {}

	public static initial(id: CustomerAccountId): CustomerAccount {
		return new CustomerAccount(
			id,
			new CustomerAccountVersion(1),
			new ReceivableCollection(id, []),
			new PaymentCollection([]),
		)
	}

	public static fromEvents(
		id: CustomerAccountId,
		events: CustomerAccountEvent[],
	): CustomerAccount {
		return events.reduce(
			(account: CustomerAccount, event: CustomerAccountEvent) => {
				if (event instanceof PaymentAddedToCustomerAccount) {
					return account.allocatePayment(
						event.payment,
						event.dateTime,
					).mutant
				}

				if (event instanceof ReceivableAddedToCustomerAccount) {
					return account.onReceivableAddedToCustomerAccount(event)
						.mutant
				}

				throw new Error("Event not supported" + event.constructor.name)
			},
			CustomerAccount.initial(id),
		)
	}

	public allocateReceivable(
		receivable: Receivable<Invoice>,
		dateTime: Timestamp,
	): CustomerAccountMutation {
		if (this.receivables.contains(receivable)) {
			throw ReceivableAlreadyAllocatedError.fromInvoice(receivable)
		}

		const event = new ReceivableAddedToCustomerAccount(
			receivable,
			this.id,
			dateTime,
		)

		const { mutant, events } =
			this.onReceivableAddedToCustomerAccount(event)

		return new Mutation(mutant, [event, ...events])
	}

	public allocatePayment(
		payment: Payment,
		dateTime: Timestamp,
	): CustomerAccountMutation {
		const payments = this.payments.with(payment)
		const receivablesMutation = this.receivables.allocatePayment(
			payment,
			dateTime,
		)

		return new Mutation(
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
		)
	}

	private onReceivableAddedToCustomerAccount(
		event: ReceivableAddedToCustomerAccount,
	): CustomerAccountMutation {
		const customerWithReceivable = new CustomerAccount(
			event.customerAccountId,
			this.version.next(),
			this.receivables.with(event.receivable),
			this.payments,
		)

		return customerWithReceivable.allocateAvailablePayments(event.dateTime)
	}

	private allocateAvailablePayments(
		dateTime: Timestamp,
	): CustomerAccountMutation {
		return this.payments.items().reduce(
			(carry: CustomerAccountMutation, payment: Payment) => {
				const receivablesAllocationOutput =
					carry.mutant.receivables.allocatePayment(payment, dateTime)

				const customerWithAllocatedPayments = new CustomerAccount(
					this.id,
					this.version,
					receivablesAllocationOutput.mutant,
					this.payments,
				)

				return new Mutation(customerWithAllocatedPayments, [
					...carry.events,
					...receivablesAllocationOutput.events,
				])
			},
			new Mutation(this, []),
		)
	}
}
