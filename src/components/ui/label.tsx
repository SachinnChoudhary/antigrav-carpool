import * as React from "react";

interface LabelProps {
    children: React.ReactNode;
    htmlFor?: string;
    className?: string;
}

export function Label({ children, htmlFor, className }: LabelProps) {
    return (
        <label
            htmlFor={htmlFor}
            className={`text-sm font-medium text-muted-foreground ${className ?? ""}`.trim()}
        >
            {children}
        </label>
    );
}
