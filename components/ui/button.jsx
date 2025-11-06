import React from "react";

export function Button({ as: Tag = "button", className = "", ...props }) {
  const C = Tag;
  return <C className={"px-4 py-2 rounded-xl border " + className} {...props} />;
}
