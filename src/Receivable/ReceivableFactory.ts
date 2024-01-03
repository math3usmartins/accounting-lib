import { type ReceivableEvent } from "./Event/ReceivableEvent"
import { type Receivable } from "../Receivable"

import * as fp from "fp-ts/function"
import * as Either from "fp-ts/lib/Either"
import { type Either as TEither } from "fp-ts/lib/Either"

export const fromEvents = <T>(
	initial: Receivable<T>,
	events: ReceivableEvent[],
): TEither<Error, Receivable<T>> =>
	events.reduce<TEither<Error, Receivable<T>>>(
		(carry, event) =>
			fp.pipe(
				carry,
				Either.flatMap((r) => r.onEvent(event)),
			),
		Either.right(initial),
	)
