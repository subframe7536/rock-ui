import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, test, vi } from 'vitest'

import { FormField } from '../form-field'
import { useFormField } from '../form-field/form-field-context'

import type { FormSubmitEvent } from './form'
import { Form } from './form'

interface TestState {
  value: string
}

function TestInput(props: { state: TestState; deferInputValidation?: boolean }) {
  const field = useFormField(undefined, () => ({
    deferInputValidation: props.deferInputValidation,
  }))

  return (
    <input
      data-testid="input"
      id={field.id()}
      name={field.name()}
      aria-invalid={field.ariaAttrs()?.['aria-invalid'] ? 'true' : undefined}
      aria-describedby={field.ariaAttrs()?.['aria-describedby'] as string | undefined}
      onInput={(event) => {
        props.state.value = event.currentTarget.value
        field.emitFormInput()
      }}
      onChange={() => field.emitFormChange()}
      onBlur={() => field.emitFormBlur()}
      onFocus={() => field.emitFormFocus()}
    />
  )
}

describe('Form', () => {
  test('emits error on submit when validation fails', async () => {
    const state: TestState = { value: '' }
    const onSubmit = vi.fn()
    const onError = vi.fn()

    const screen = render(() => (
      <Form
        data-testid="form"
        state={state}
        validateOnInputDelay={0}
        validate={(currentState) => {
          if (currentState?.value !== 'valid') {
            return [{ name: 'value', message: 'Error message' }]
          }

          return []
        }}
        onSubmit={onSubmit}
        onError={onError}
      >
        <FormField name="value" label="Value">
          <TestInput state={state} />
        </FormField>
      </Form>
    ))

    await fireEvent.submit(screen.getByTestId('form'))

    await waitFor(() => {
      expect(onError).toHaveBeenCalledTimes(1)
    })
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('Error message')).not.toBeNull()
  })

  test('input validation is deferred until blur when not eager', async () => {
    const state: TestState = { value: '' }

    const screen = render(() => (
      <Form
        state={state}
        validateOn={['input']}
        validateOnInputDelay={0}
        validate={(currentState) => {
          if (currentState?.value !== 'valid') {
            return [{ name: 'value', message: 'Error message' }]
          }

          return []
        }}
      >
        <FormField name="value" label="Value">
          <TestInput state={state} deferInputValidation />
        </FormField>
      </Form>
    ))

    const input = screen.getByTestId('input')

    await fireEvent.input(input, { target: { value: 'invalid' } })

    await waitFor(() => {
      expect(screen.queryByText('Error message')).toBeNull()
    })

    await fireEvent.blur(input)
    await fireEvent.input(input, { target: { value: 'invalid' } })

    await waitFor(() => {
      expect(screen.getByText('Error message')).not.toBeNull()
    })

    await fireEvent.input(input, { target: { value: 'valid' } })

    await waitFor(() => {
      expect(screen.queryByText('Error message')).toBeNull()
    })
  })

  test('passes validated data to submit handler', async () => {
    const state: TestState = { value: 'valid' }
    const onSubmit = vi.fn((event: FormSubmitEvent) => {
      expect(event.data).toEqual(state)
    })
    const onError = vi.fn()

    const screen = render(() => (
      <Form
        data-testid="form"
        state={state}
        validate={(currentState) => {
          if (currentState?.value !== 'valid') {
            return [{ name: 'value', message: 'Error message' }]
          }

          return []
        }}
        onSubmit={onSubmit}
        onError={onError}
      >
        <FormField name="value" label="Value">
          <TestInput state={state} />
        </FormField>
      </Form>
    ))

    await fireEvent.submit(screen.getByTestId('form'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1)
    })
    expect(onError).not.toHaveBeenCalled()
  })
})
