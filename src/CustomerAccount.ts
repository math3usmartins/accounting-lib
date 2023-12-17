import { type CustomerAccountId } from "./CustomerAccount/CustomerAccountId"
import { ReceivableCollection } from "./Receivable/ReceivableCollection"
import { type Receivable } from "./Receivable"
import { type Payment } from "./Payment"
import { type Timestamp } from "./Timestamp"
import { PaymentCollection } from "./Payment/PaymentCollection"
import { AggregateCommandOutput } from "./AggregateCommandOutput"
import { PaymentAddedToCustomerAccount } from "./CustomerAccount/Event/PaymentAddedToCustomerAccount"
import { ReceivableAddedToCustomerAccount } from "./CustomerAccount/Event/ReceivableAddedToCustomerAccount"
import { type CustomerAccountEvent } from "./CustomerAccount/CustomerAccountEvent"
import { type Invoice } from "./Receivable/Invoice"
import { CustomerAccountVersion } from "./CustomerAccount/CustomerAccountVersion"
import { ReceivableAlreadyAllocatedError } from "./CustomerAccount/Error/ReceivableAlreadyAllocatedError"

type CustomerAccountAggregateCommandOutput = AggregateCommandOutput<
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
					).aggregate
				}

				if (event instanceof ReceivableAddedToCustomerAccount) {
					return account.onReceivableAddedToCustomerAccount(event)
						.aggregate
				}

				throw new Error("Event not supported" + event.constructor.name)
			},
			CustomerAccount.initial(id),
		)
	}

	public allocateReceivable(
		receivable: Receivable<Invoice>,
		dateTime: Timestamp,
	): CustomerAccountAggregateCommandOutput {
		if (this.receivables.contains(receivable)) {
			throw ReceivableAlreadyAllocatedError.fromInvoice(receivable)
		}

		const event = new ReceivableAddedToCustomerAccount(
			receivable,
			this.id,
			dateTime,
		)

		const { aggregate, events } =
			this.onReceivableAddedToCustomerAccount(event)

		return new AggregateCommandOutput(aggregate, [event, ...events])
	}

	public allocatePayment(
		payment: Payment,
		dateTime: Timestamp,
	): CustomerAccountAggregateCommandOutput {
		const payments = this.payments.with(payment)
		const receivablesAllocation = this.receivables.allocatePayment(
			payment,
			dateTime,
		)

		return new AggregateCommandOutput(
			new CustomerAccount(
				this.id,
				this.version.next(),
				receivablesAllocation.aggregate,
				payments,
			),
			[
				new PaymentAddedToCustomerAccount(
					payment,
					this.id,
					payment.dateTime,
				),
				...receivablesAllocation.events,
			],
		)
	}

	private onReceivableAddedToCustomerAccount(
		event: ReceivableAddedToCustomerAccount,
	): CustomerAccountAggregateCommandOutput {
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
	): CustomerAccountAggregateCommandOutput {
		return this.payments.items().reduce(
			(
				carry: CustomerAccountAggregateCommandOutput,
				payment: Payment,
			) => {
				const receivablesAllocationOutput =
					carry.aggregate.receivables.allocatePayment(
						payment,
						dateTime,
					)

				const customerWithAllocatedPayments = new CustomerAccount(
					this.id,
					this.version,
					receivablesAllocationOutput.aggregate,
					this.payments,
				)

				return new AggregateCommandOutput(
					customerWithAllocatedPayments,
					[...carry.events, ...receivablesAllocationOutput.events],
				)
			},
			new AggregateCommandOutput(this, []),
		)
	}
}
