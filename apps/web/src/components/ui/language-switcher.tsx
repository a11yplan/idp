"use client"

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
] as const

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0]

  const switchLocale = (newLocale: string) => {
    // Get the current path without the locale prefix
    const segments = pathname.split('/')
    const hasLocalePrefix = segments[1] === 'de' || segments[1] === 'en'

    let newPath: string
    if (newLocale === 'en') {
      // Remove locale prefix for English (default locale)
      if (hasLocalePrefix) {
        newPath = '/' + segments.slice(2).join('/')
      } else {
        newPath = pathname
      }
    } else {
      // Add /de prefix for German
      if (hasLocalePrefix) {
        segments[1] = newLocale
        newPath = segments.join('/')
      } else {
        newPath = `/${newLocale}${pathname}`
      }
    }

    router.push(newPath || '/')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Languages className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => switchLocale(lang.code)}
            className="flex items-center gap-2"
          >
            <span className="text-xl">{lang.flag}</span>
            <span>{lang.name}</span>
            {lang.code === locale && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
