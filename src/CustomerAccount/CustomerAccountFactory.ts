import { CustomerAccount } from "../CustomerAccount"
import { type CustomerAccountEvent } from "./CustomerAccountEvent"
import { PaymentAddedToCustomerAccount } from "./Event/PaymentAddedToCustomerAccount"
import { ReceivableAddedToCustomerAccount } from "./Event/ReceivableAddedToCustomerAccount"
import { type CustomerAccountId } from "./CustomerAccountId"

import * as fp from "fp-ts/function"
import * as Option from "fp-ts/lib/Option"
import * as Either from "fp-ts/lib/Either"
import { type Option as TOption } from "fp-ts/lib/Option"
import { type Either as TEither } from "fp-ts/lib/Either"
import {
	onPaymentAddedToCustomerAccount,
	onReceivableAddedToCustomerAccount,
} from "./CustomerAccountListener"

export const fromEvents = (
	id: CustomerAccountId,
	events: CustomerAccountEvent[],
): TEither<Error, CustomerAccount> =>
	events.reduce(
		(
			carry: TEither<Error, CustomerAccount>,
			event: CustomerAccountEvent,
		): TEither<Error, CustomerAccount> =>
			fp.pipe(
				carry,
				Either.flatMap((customerAccount) =>
					fp.pipe(
						isPaymentAddedToCustomerAccount(event),
						Option.map((event) =>
							onPaymentAddedToCustomerAccount(
								customerAccount,
								event,
							),
						),
						Option.alt(() =>
							fp.pipe(
								isReceivableAddedToCustomerAccount(event),
								Option.map((event) =>
									onReceivableAddedToCustomerAccount(
										customerAccount,
										event,
									),
								),
								Option.map((mutation) =>
									Either.right(mutation.mutant),
								),
							),
						),
						Option.getOrElse(() => carry),
					),
				),
			),
		Either.right(CustomerAccount.initial(id)),
	)

const isPaymentAddedToCustomerAccount = (
	event: CustomerAccountEvent,
): TOption<PaymentAddedToCustomerAccount> =>
	fp.pipe(
		event,
		Option.fromPredicate(
			(event): event is PaymentAddedToCustomerAccount =>
				event instanceof PaymentAddedToCustomerAccount,
		),
	)

const isReceivableAddedToCustomerAccount = (
	event: CustomerAccountEvent,
): TOption<ReceivableAddedToCustomerAccount> =>
	fp.pipe(
		event,
		Option.fromPredicate(
			(event): event is ReceivableAddedToCustomerAccount =>
				event instanceof ReceivableAddedToCustomerAccount,
		),
	)
