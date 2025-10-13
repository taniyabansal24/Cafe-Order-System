import * as React from "react";

export function RadioGroup({ children, value, onChange }) {
  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { checked: child.props.value === value, onChange })
      )}
    </div>
  );
}

export function RadioGroupItem({ label, value, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
      />
      {label}
    </label>
  );
}
