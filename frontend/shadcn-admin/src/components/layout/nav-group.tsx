import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { Link, useLocation } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { type ReactNode } from 'react'
import { Badge } from '../ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import {
  type NavCollapsible,
  type NavGroup as NavGroupProps,
  type NavItem,
  type NavLink,
} from './types'

export function NavGroup({ title, items }: NavGroupProps) {
  const { state, isMobile } = useSidebar()
  const href = useLocation({ select: (location) => location.href })

  return (
    <SidebarGroup>
      {/* Group label with HomeBase style */}
      <SidebarGroupLabel
        style={{
          fontFamily: "'Nunito', sans-serif",
          fontWeight: 800,
          fontSize: '0.65rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#A855F7',
          opacity: 0.7,
          marginBottom: '0.25rem',
        }}
      >
        {title}
      </SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => {
          const key = `${item.title}-${item.url}`
          if (!item.items)
            return <SidebarMenuLink key={key} item={item} href={href} />
          if (state === 'collapsed' && !isMobile)
            return <SidebarMenuCollapsedDropdown key={key} item={item} href={href} />
          return <SidebarMenuCollapsible key={key} item={item} href={href} />
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

function NavBadge({ children }: { children: ReactNode }) {
  return (
    <Badge
      className='rounded-full px-1.5 py-0 text-xs font-700'
      style={{
        background: 'linear-gradient(135deg, #FF6B6B, #A855F7)',
        color: '#fff',
        border: 'none',
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 800,
      }}
    >
      {children}
    </Badge>
  )
}

function SidebarMenuLink({ item, href }: { item: NavLink; href: string }) {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.title}
        style={{
          borderRadius: 10,
          fontFamily: "'Nunito', sans-serif",
          fontWeight: isActive ? 800 : 600,
          ...(isActive && {
            background: 'linear-gradient(135deg, rgba(255,107,107,0.12), rgba(168,85,247,0.12))',
            color: '#A855F7',
          }),
        }}
      >
        <Link to={item.url} onClick={() => setOpenMobile(false)}>
          {item.icon && (
            <item.icon
              style={{
                color: isActive ? '#A855F7' : undefined,
                width: 16,
                height: 16,
              }}
            />
          )}
          <span>{item.title}</span>
          {item.badge && <NavBadge>{item.badge}</NavBadge>}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function SidebarMenuCollapsible({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) {
  const { setOpenMobile } = useSidebar()
  const isActive = checkIsActive(href, item, true)

  return (
    <Collapsible
      asChild
      defaultOpen={isActive}
      className='group/collapsible'
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            style={{
              borderRadius: 10,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: isActive ? 800 : 600,
              ...(isActive && {
                background: 'linear-gradient(135deg, rgba(255,107,107,0.12), rgba(168,85,247,0.12))',
                color: '#A855F7',
              }),
            }}
          >
            {item.icon && (
              <item.icon
                style={{ color: isActive ? '#A855F7' : undefined, width: 16, height: 16 }}
              />
            )}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 rtl:rotate-180' />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent className='CollapsibleContent'>
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const subActive = checkIsActive(href, subItem)
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={subActive}
                    style={{
                      borderRadius: 8,
                      fontFamily: "'Nunito', sans-serif",
                      fontWeight: subActive ? 800 : 600,
                      ...(subActive && { color: '#A855F7' }),
                    }}
                  >
                    <Link to={subItem.url} onClick={() => setOpenMobile(false)}>
                      {subItem.icon && (
                        <subItem.icon
                          style={{ color: subActive ? '#A855F7' : undefined, width: 14, height: 14 }}
                        />
                      )}
                      <span>{subItem.title}</span>
                      {subItem.badge && <NavBadge>{subItem.badge}</NavBadge>}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function SidebarMenuCollapsedDropdown({
  item,
  href,
}: {
  item: NavCollapsible
  href: string
}) {
  const isActive = checkIsActive(href, item)

  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            tooltip={item.title}
            isActive={isActive}
            style={{
              borderRadius: 10,
              fontFamily: "'Nunito', sans-serif",
              fontWeight: isActive ? 800 : 600,
              ...(isActive && {
                background: 'linear-gradient(135deg, rgba(255,107,107,0.12), rgba(168,85,247,0.12))',
                color: '#A855F7',
              }),
            }}
          >
            {item.icon && (
              <item.icon style={{ color: isActive ? '#A855F7' : undefined, width: 16, height: 16 }} />
            )}
            <span>{item.title}</span>
            {item.badge && <NavBadge>{item.badge}</NavBadge>}
            <ChevronRight className='ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
          </SidebarMenuButton>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side='right'
          align='start'
          sideOffset={4}
          className='rounded-xl'
        >
          <DropdownMenuLabel
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              color: '#A855F7',
            }}
          >
            {item.title} {item.badge ? `(${item.badge})` : ''}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {item.items.map((sub) => {
            const subActive = checkIsActive(href, sub)
            return (
              <DropdownMenuItem
                key={`${sub.title}-${sub.url}`}
                asChild
              >
                <Link
                  to={sub.url}
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: subActive ? 800 : 600,
                    ...(subActive && { color: '#A855F7' }),
                  }}
                  className={subActive ? 'bg-secondary' : ''}
                >
                  {sub.icon && <sub.icon style={{ width: 14, height: 14 }} />}
                  <span className='max-w-52 text-wrap'>{sub.title}</span>
                  {sub.badge && (
                    <span className='ms-auto text-xs'>{sub.badge}</span>
                  )}
                </Link>
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  )
}

function checkIsActive(href: string, item: NavItem, mainNav = false) {
  return (
    href === item.url ||
    href.split('?')[0] === item.url ||
    !!item?.items?.filter((i) => i.url === href).length ||
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.url?.split('/')[1])
  )
}