export function getAutocompleteTextFieldProps(params) {
  const slotProps = params.slotProps ?? {
    input: params.InputProps,
    htmlInput: params.inputProps,
    inputLabel: params.InputLabelProps,
  };

  return {
    id: params.id,
    fullWidth: params.fullWidth,
    size: params.size,
    disabled: params.disabled,
    slotProps,
  };
}
