import { ComponentType } from 'react'

export type DynamicField = {
  value: string
  label: string
}

export type ResolvedValues = Record<string, string>

export type DynamicFieldDropdownProps = {
  items: DynamicField[]
  onSelect: (field: DynamicField) => void
  selectedIndex: number
}

export type DynamicFieldDropdownComponent = ComponentType<DynamicFieldDropdownProps>

export type HandlebarTemplateProps = {
  value: string
  label: string
  showResolved: boolean
  resolvedValue?: string
}

export type HandlebarTemplateComponent = ComponentType<HandlebarTemplateProps>

export type DynamicFieldConfig = {
  fields: DynamicField[]
  resolvedValues?: ResolvedValues
  showResolved?: boolean
  dropdownComponent?: DynamicFieldDropdownComponent
  templateComponent?: HandlebarTemplateComponent
}
