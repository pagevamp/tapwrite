import { ReactRenderer } from '@tiptap/react'
import tippy, { type Instance, type Props as TippyProps } from 'tippy.js'
import { AutofillMenu } from './AutofillMenu'
import type { DynamicField, DynamicFieldDropdownComponent } from './autofill-field.types'

export const autofillMenuSuggestion = (
  dynamicFields: DynamicField[],
  CustomDropdown?: DynamicFieldDropdownComponent,
) => ({
  items: ({ query }: { query: string }): DynamicField[] => {
    const normalized = query.toLowerCase()
    return dynamicFields
      .filter((item) => item.label.toLowerCase().includes(normalized))
      .slice(0, 10)
  },

  char: '{{',

  render: () => {
    let component: ReactRenderer<{ onKeyDown: (args: { event: KeyboardEvent }) => boolean }> | null = null
    let popup: Instance<TippyProps>[] | null = null

    return {
      onStart: (props: any) => {
        if (props.editor.storage.autofillField?.showDynamicFieldValue) {
          return
        }

        component = new ReactRenderer(AutofillMenu, {
          props: { ...props, CustomDropdown },
          editor: props.editor,
        })

        if (!props.clientRect) {
          return
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props: any) {
        if (!component) return

        component.updateProps({ ...props, CustomDropdown })

        if (!props.clientRect) {
          return
        }

        popup?.[0]?.setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props: any) {
        if (!component) return false

        if (props.event.key === 'Escape') {
          popup?.[0]?.hide()
          return true
        }

        return component.ref?.onKeyDown(props) ?? false
      },

      onExit() {
        popup?.[0]?.destroy()
        popup = null
        component?.destroy()
        component = null
      },
    }
  },
})
