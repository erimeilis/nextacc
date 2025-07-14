export type DatePickerProps = {
  value: Date | null
  onChangeAction: (date: Date | null) => void
  placeholder?: string
  className?: string
}
