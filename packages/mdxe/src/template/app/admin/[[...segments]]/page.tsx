// @ts-nocheck
import { AdminView } from '@payloadcms/next/views'
import { RootLayout } from '@payloadcms/next/layouts'
import configPromise from '../../../payload.config'

export default async function AdminPage({ params }: { params: { segments: string[] } }) {
  return (
    <RootLayout config={configPromise}>
      <AdminView params={params} searchParams={{}} />
    </RootLayout>
  )
}

export const dynamic = 'force-dynamic'
