import { NavigationProgress } from '@/components/navigation-progress'
import { Toaster } from '@/components/ui/sonner'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'
import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => (
    <>
      <NavigationProgress />
      <Outlet />
      <Toaster duration={5000} />
      {/* {import.meta.env.MODE === 'development' && (
  <>
    <ReactQueryDevtools buttonPosition='bottom-left' />
    <TanStackRouterDevtools position='bottom-right' />
  </>
)} */}
    </>
  ),
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
