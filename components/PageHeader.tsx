'use client'
import React from 'react'

interface PageHeaderProps {
  children: React.ReactNode
  style?: React.CSSProperties
}

export default function PageHeader({ children, style }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      paddingTop: 'max(14px, env(safe-area-inset-top))',
      paddingBottom: 14,
      paddingLeft: 16,
      paddingRight: 16,
      background: 'rgba(10,10,10,0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid #161616',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      gap: 12,
      ...style,
    }}>
      {children}
    </div>
  )
}
