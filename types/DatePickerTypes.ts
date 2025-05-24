export type DatePickerProps = {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  className?: string
}