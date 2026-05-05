import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap cursor-pointer transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-[#1F8A5B]/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-red-500 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-[#1F8A5B] text-white border-transparent hover:bg-[#1F8A5B]/80",
        outline:
          "border-[#1F8A5B]/30 bg-transparent text-[#E8F5EE] hover:bg-[#1F8A5B]/10 hover:border-[#1F8A5B] hover:text-[#6ED3A3]",
        secondary:
          "bg-[#16221B] text-[#A0B5A8] border-[#1F8A5B]/20 hover:bg-[#1F8A5B]/10 hover:text-[#6ED3A3]",
        ghost:
          "border-transparent text-[#A0B5A8] hover:bg-[#1F8A5B]/10 hover:text-[#6ED3A3]",
        destructive:
          "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/30",
        link: "border-transparent text-[#6ED3A3] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 gap-1.5 px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-md px-2.5 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 gap-1.5 px-4 text-base",
        icon: "size-8",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-md",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
