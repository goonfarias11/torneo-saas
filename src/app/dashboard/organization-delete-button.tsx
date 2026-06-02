'use client'

import { deleteOrganization } from '@/actions/organization'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { useTransition } from 'react'

export function OrganizationDeleteButton({ organizationId }: { organizationId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!window.confirm('¿Eliminar esta organización? Esta acción no se puede deshacer.')) {
      return
    }

    startTransition(async () => {
      await deleteOrganization(organizationId)
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
