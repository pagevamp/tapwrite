import * as React from 'react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import type { DynamicField, DynamicFieldDropdownComponent } from './autofill-field.types'

type AutofillMenuProps = {
  items: DynamicField[]
  command: (item: DynamicField) => void
  CustomDropdown?: DynamicFieldDropdownComponent
}

const DefaultDropdownItem = ({
  field,
  focused,
  onClick,
}: {
  field: DynamicField
  focused: boolean
  onClick: () => void
}) => {
  return (
    <button
      className={`flex flex-row gap-x-2.5 items-center py-1.5 px-3 cursor-pointer outline-none w-full text-left ${
        focused ? 'bg-new-white-2' : ''
      }`}
      onClick={onClick}
    >
      <p className="text-sm">{field.label}</p>
    </button>
  )
}

export const AutofillMenu = forwardRef<
  { onKeyDown: (args: { event: KeyboardEvent }) => boolean },
  AutofillMenuProps
>((props, ref) => {
  const { items, command, CustomDropdown } = props
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = items[index]
    if (item) {
      command(item)
    }
  }

  useEffect(() => setSelectedIndex(0), [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i - 1 + items.length) % items.length)
        return true
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % items.length)
        return true
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  if (CustomDropdown) {
    return (
      <CustomDropdown
        items={items}
        onSelect={(field) => command(field)}
        selectedIndex={selectedIndex}
      />
    )
  }

  return (
    <div className="flex flex-col gap-0.5 bg-white py-2 border border-new-card-border rounded shadow-vairant-1 w-fit overflow-hidden relative max-h-72 overflow-y-auto min-w-[192px]">
      {items.length > 0 ? (
        items.map((field, index) => (
          <DefaultDropdownItem
            key={field.value}
            field={field}
            focused={index === selectedIndex}
            onClick={() => selectItem(index)}
          />
        ))
      ) : (
        <div className="py-1.5 px-3">
          <p className="text-sm text-gray-400">No fields found</p>
        </div>
      )}
    </div>
  )
})

AutofillMenu.displayName = 'AutofillMenu'
