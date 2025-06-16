import * as React from 'react'
import {cn} from '@/lib/utils'

// Create a context to pass the horizontal prop to children
const ListGroupContext = React.createContext(false)

interface ListGroupType extends React.ForwardRefExoticComponent<
  React.HTMLAttributes<HTMLDivElement> & {
    horizontal?: boolean;
  } & React.RefAttributes<HTMLDivElement>
> {
  Item: typeof ListGroupItem;
}

const ListGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    horizontal?: boolean;
  }
>(({ className, horizontal = false, children, ...props }, ref) => (
  <ListGroupContext.Provider value={horizontal}>
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-border bg-background dark:border-border dark:bg-background",
        horizontal && "flex flex-row",
        className
      )}
      {...props}
    >
      {children}
    </div>
  </ListGroupContext.Provider>
)) as ListGroupType
ListGroup.displayName = "ListGroup"

const ListGroupItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    active?: boolean;
    value?: string;
    onClick?: () => void;
  }
>(({ className, active, children, ...props }, ref) => {
  // Get the horizontal value from context
  const isHorizontal = React.useContext(ListGroupContext);

  return (
    <div
      ref={ref}
      className={cn(
        "flex cursor-pointer items-center py-2 px-4 text-sm font-medium hover:bg-accent focus:outline-none dark:hover:bg-accent",
        // Apply different border and rounded styles based on horizontal or vertical layout
        isHorizontal 
          ? "border-r border-border last:border-r-0 first:rounded-l-lg last:rounded-r-lg dark:border-border"
          : "w-full border-b border-border first:rounded-t-lg last:rounded-b-lg last:border-b-0 dark:border-border",
        active && "bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
})
ListGroupItem.displayName = "ListGroupItem"

// Attach Item to ListGroup for compatibility with flowbite-react
ListGroup.Item = ListGroupItem

export { ListGroup, ListGroupItem }
