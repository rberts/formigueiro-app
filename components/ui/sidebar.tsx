import * as React from "react";
import { cn } from "@/components/lib/utils";

type SidebarProps = React.HTMLAttributes<HTMLElement>;

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(({ className, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn(
      "flex h-full min-h-screen w-64 flex-col border-r border-slate-800 bg-slate-900/70",
      className
    )}
    {...props}
  />
));
Sidebar.displayName = "Sidebar";

const SidebarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("border-b border-slate-800 p-4", className)} {...props} />
);
SidebarHeader.displayName = "SidebarHeader";

const SidebarContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 overflow-y-auto", className)} {...props} />
);
SidebarContent.displayName = "SidebarContent";

const SidebarGroup = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-3 py-2", className)} {...props} />
);
SidebarGroup.displayName = "SidebarGroup";

const SidebarGroupLabel = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("mb-2 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500", className)}
    {...props}
  />
);
SidebarGroupLabel.displayName = "SidebarGroupLabel";

const SidebarGroupContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-1", className)} {...props} />
);
SidebarGroupContent.displayName = "SidebarGroupContent";

const SidebarMenu = ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn("space-y-1", className)} {...props} />
);
SidebarMenu.displayName = "SidebarMenu";

const SidebarMenuItem = ({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => (
  <li className={cn("", className)} {...props} />
);
SidebarMenuItem.displayName = "SidebarMenuItem";

type SidebarMenuButtonProps = React.HTMLAttributes<HTMLElement> & {
  asChild?: boolean;
  active?: boolean;
};

const SidebarMenuButton = ({
  className,
  children,
  asChild = false,
  active = false,
  ...props
}: SidebarMenuButtonProps) => {
  const classes = cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition",
    "hover:bg-slate-800",
    "data-[active=true]:bg-slate-800 data-[active=true]:text-white",
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn(classes, (children.props as { className?: string }).className),
      "data-active": active,
      ...props,
    });
  }

  return (
    <button className={classes} data-active={active} type="button" {...props}>
      {children}
    </button>
  );
};
SidebarMenuButton.displayName = "SidebarMenuButton";

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
};
