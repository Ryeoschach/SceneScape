import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import { ComponentProps } from '../../types'

interface LayoutProps extends ComponentProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="h-screen grid grid-cols-[260px_1fr] grid-rows-[64px_1fr] bg-gray-50 dark:bg-gray-900">
      <Header className="col-span-2 row-start-1 row-end-2" />
      <Sidebar className="row-start-2 col-start-1 col-end-2 h-full" />
      <main className="row-start-2 col-start-2 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
