import React from "react";

export function Card({ className = "", ...props }) {
  return <div className={"rounded-2xl border p-4 shadow-sm " + className} {...props} />;
}
export function CardHeader({ className = "", ...props }) {
  return <div className={"mb-2 " + className} {...props} />;
}
export function CardTitle({ className = "", ...props }) {
  return <h3 className={"text-lg font-semibold " + className} {...props} />;
}
export function CardDescription({ className = "", ...props }) {
  return <p className={"text-sm text-gray-500 " + className} {...props} />;
}
export function CardContent({ className = "", ...props }) {
  return <div className={className} {...props} />;
}
export function CardFooter({ className = "", ...props }) {
  return <div className={"mt-4 " + className} {...props} />;
}
