import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const Dropdown = ({
  label,
  children,
  className,
  ...props
}: {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="link" 
          className={cn("text-white hover:text-white focus:outline-none focus:bg-transparent", className)}
          {...props}
        >
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Add Item component for compatibility with flowbite-react
const DropdownItem = ({
  href,
  children,
  ...props
}: {
  href?: string;
  children: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof DropdownMenuItem>) => {
  return (
    <DropdownMenuItem asChild={!!href} {...props}>
      {href ? <a href={href}>{children}</a> : children}
    </DropdownMenuItem>
  )
}

// Attach Item to Dropdown for compatibility with flowbite-react
Dropdown.Item = DropdownItem

export { Dropdown }
