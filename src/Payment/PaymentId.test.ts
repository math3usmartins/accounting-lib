import assert from "assert"
import "mocha"
import { PaymentId } from "./PaymentId"

describe("PaymentId", (): void => {
	interface Scenario {
		name: string
		a: PaymentId
		b: PaymentId
		expected: boolean
	}

	const isEqualToScenarios = [
		{
			name: "same values",
			a: new PaymentId("1"),
			b: new PaymentId("1"),
			expected: true,
		},
		{
			name: "different values",
			a: new PaymentId("1"),
			b: new PaymentId("2"),
			expected: false,
		},
	]

	isEqualToScenarios.forEach((scenario: Scenario) => {
		it(`isEqualTo: ${scenario.name}`, (): void => {
			const actual = scenario.a.isEqualTo(scenario.b)
			assert.equal(actual, scenario.expected)
		})
	})
})
