import {
	CustomerAccount,
	type CustomerAccountMutation,
} from "../CustomerAccount"
import { type PaymentAddedToCustomerAccount } from "./Event/PaymentAddedToCustomerAccount"
import { type ReceivableAddedToCustomerAccount } from "./Event/ReceivableAddedToCustomerAccount"

import * as fp from "fp-ts/function"
import * as Either from "fp-ts/lib/Either"
import { type Either as TEither } from "fp-ts/lib/Either"

export const onReceivableAddedToCustomerAccount = (
	customerAccount: CustomerAccount,
	event: ReceivableAddedToCustomerAccount,
): CustomerAccountMutation =>
	fp.pipe(
		new CustomerAccount(
			event.customerAccountId,
			customerAccount.version.next(),
			customerAccount.receivables.with(event.receivable),
			customerAccount.payments,
		),
		(customerWithReceivable) =>
			customerWithReceivable.allocateAvailablePayments(event.dateTime),
	)

export const onPaymentAddedToCustomerAccount = (
	customerAccount: CustomerAccount,
	event: PaymentAddedToCustomerAccount,
): TEither<Error, CustomerAccount> =>
	fp.pipe(
		customerAccount.allocatePayment(event.payment, event.dateTime),
		Either.map((mutation) => mutation.mutant),
	)
