import { type NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import React, { useEffect, useReducer } from 'react'
import type { DynamicField, HandlebarTemplateComponent } from './autofill-field.types'

export const AutofillComponent = ({ node, editor, extension }: NodeViewProps) => {
  const value = node.attrs.value as string

  // Force re-render on every transaction so we always read fresh storage values
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    editor.on('transaction', forceUpdate)
    return () => {
      editor.off('transaction', forceUpdate)
    }
  }, [editor])

  const showResolved: boolean = extension.storage.showDynamicFieldValue ?? false
  const resolvedValues: Record<string, string> = extension.storage.resolvedValues ?? {}
  const TemplateComponent: HandlebarTemplateComponent | undefined = extension.options.TemplateComponent

  const dynamicFields: DynamicField[] = extension.options.dynamicFields ?? []
  const fieldDef = dynamicFields.find((f) => f.value === value)
  const label = fieldDef?.label ?? value

  // Resolved mode: show plain resolved text
  if (showResolved) {
    return (
      <NodeViewWrapper as="span" className="inline-flex align-baseline">
        <span>{resolvedValues[value] ?? value}</span>
      </NodeViewWrapper>
    )
  }

   // Custom template component
  if (TemplateComponent) {
    return (
      <NodeViewWrapper as="span" className="mx-0.5 inline-flex align-baseline">
        <TemplateComponent
          value={value}
          label={label}
          showResolved={showResolved}
          resolvedValue={resolvedValues[value]}
        />
      </NodeViewWrapper>
    )
  }

  // Default template pill — matches client-home-v3 style with {{ }}
  return (
    <NodeViewWrapper as="span" className="inline-flex align-baseline">
      <span
        title={value}
        style={{ fontSize: 'inherit', lineHeight: 1.25 }}
        className="relative inline-flex w-fit max-w-full items-center overflow-clip rounded border border-gray-300 bg-white px-1 font-normal text-gray-500"
      >
        <span className="line-clamp-1 text-ellipsis break-all">{value}</span>
      </span>
    </NodeViewWrapper>
  )
}
