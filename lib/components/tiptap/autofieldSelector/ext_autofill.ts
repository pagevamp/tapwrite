import { mergeAttributes, Node } from '@tiptap/core'
import { PluginKey } from '@tiptap/pm/state'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { Suggestion } from '@tiptap/suggestion'
import { AutofillComponent } from './AutofillComponent'
import { autofillMenuSuggestion } from './autofillMenuSuggestion'
import type {
  DynamicField,
  DynamicFieldDropdownComponent,
  HandlebarTemplateComponent,
  ResolvedValues,
} from './autofill-field.types'

const autofillSuggestionKey = new PluginKey('autofillSuggestion')

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    autofillField: {
      insertAutofillField: (attrs: { value: string }) => ReturnType
    }
  }
}

export interface AutofillExtensionOptions {
  dynamicFields: DynamicField[]
  resolvedValues: ResolvedValues
  showDynamicFieldValue: boolean
  CustomDropdown?: DynamicFieldDropdownComponent
  TemplateComponent?: HandlebarTemplateComponent
}

export const AutofillExtension = Node.create<AutofillExtensionOptions>({
  name: 'autofillField',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return {
      dynamicFields: [],
      resolvedValues: {},
      showDynamicFieldValue: false,
      CustomDropdown: undefined,
      TemplateComponent: undefined,
    }
  },

  addStorage() {
    return {
      resolvedValues: {} as ResolvedValues,
      showDynamicFieldValue: false,
    }
  },

  onCreate() {
    this.storage.resolvedValues = this.options.resolvedValues
    this.storage.showDynamicFieldValue = this.options.showDynamicFieldValue
  },

  addAttributes() {
    return {
      value: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-value'),
        renderHTML: (attributes: Record<string, any>) => ({
          'data-value': attributes.value,
        }),
      },
    }
  },

  parseHTML() {
    return [{ tag: 'autofill-field[data-value]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['autofill-field', mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(AutofillComponent)
  },

  addCommands() {
    return {
      insertAutofillField:
        (attrs) =>
        ({ chain }) =>
          chain()
            .focus()
            .insertContent([
              { type: this.name, attrs },
              { type: 'text', text: ' ' },
            ])
            .run(),
    }
  },

  addProseMirrorPlugins() {
    const suggestion = autofillMenuSuggestion(
      this.options.dynamicFields,
      this.options.CustomDropdown,
    )

    return [
      Suggestion<DynamicField>({
        editor: this.editor,
        pluginKey: autofillSuggestionKey,
        char: suggestion.char,
        items: suggestion.items,

        command: ({ editor, range, props }) => {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent([
              { type: this.name, attrs: { value: props.value } },
              { type: 'text', text: ' ' },
            ])
            .run()
        },

        render: suggestion.render,
      }),
    ]
  },
})
