import React from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Store, Home, ArrowLeft } from 'lucide-react'

const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center selection:bg-primary/20">
      <div className="w-full max-w-md space-y-6">
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-muted/60 border border-border/80 shadow-2xs">
          <div className="w-7 h-7 bg-primary rounded-xl flex items-center justify-center shadow-xs">
            <Store className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">NexPOS</span>
        </div>

        <div className="space-y-2">
          <span className="text-7xl font-extrabold font-mono tracking-tighter text-primary/40 block">
            404
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            The terminal page or portal route you requested could not be located. It might have been moved or the URL is mistyped.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button asChild variant="default" className="h-11 rounded-xl px-6">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PageNotFound