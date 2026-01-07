import { Card, CardBody, cn } from "@heroui/react"

interface SatisfactionRatingCardProps {
  rating: number
  comment?: string
  className?: string
}

export function SatisfactionRatingCard({ rating, comment, className }: SatisfactionRatingCardProps) {
  // Generate star display (filled and empty stars)
  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <span key={i} className="text-amber-400 text-2xl leading-none">
            ★
          </span>,
        )
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <span key={i} className="text-amber-400 text-2xl leading-none relative">
            <span className="absolute inset-0 text-amber-200">★</span>
            <span className="relative inline-block overflow-hidden w-[0.5em]">★</span>
          </span>,
        )
      } else {
        stars.push(
          <span key={i} className="text-amber-200 dark:text-amber-800 text-2xl leading-none">
            ★
          </span>,
        )
      }
    }
    return stars
  }

  // Calculate percentage for progress bar
  const percentage = (rating / 5) * 100

  // Get rating label
  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return "Excelente"
    if (rating >= 4) return "Muy bueno"
    if (rating >= 3) return "Bueno"
    if (rating >= 2) return "Regular"
    return "Necesita mejorar"
  }

  return (
    <Card
      className={cn(
        "border-2 border-amber-200 dark:border-amber-800/50 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/10",
        className,
      )}
    >
      {/* Header */}
      <CardBody className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 text-lg">Satisfacción del Denunciante</h3>
          <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 rounded-full">
            <span className="text-amber-600 dark:text-amber-400 text-sm">★</span>
            <span className="font-bold text-amber-900 dark:text-amber-100 text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Star Display */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1">{renderStars()}</div>
          <span className="text-amber-700 dark:text-amber-300 font-medium text-sm">{getRatingLabel(rating)}</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
            <span>Calificación general</span>
            <span className="font-semibold">{rating} de 5</span>
          </div>
          <div className="h-2 bg-amber-100 dark:bg-amber-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Comment Section */}
        {comment && (
          <div className="mt-4 pt-4 border-t border-amber-200 dark:border-amber-800/50">
            <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-2">Comentario:</p>
            <div className="bg-white dark:bg-black/20 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30">
              <p className="text-sm text-amber-900 dark:text-amber-100 italic leading-relaxed">"{comment}"</p>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}
