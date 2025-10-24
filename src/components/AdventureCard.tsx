// src/components/AdventureCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Adventure } from '@/types/api'

interface AdventureCardProps {
  adventure: Adventure
  onClick: () => void
  isSelected: boolean
  isCompressed: boolean
  index: number
}

export function AdventureCard({
  adventure,
  onClick,
  isSelected,
  isCompressed,
  index,
}: AdventureCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isSelected ? 1 : isCompressed ? 0.5 : 1,
        y: 0,
      }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
        delay: index * 0.05,
      }}
      whileHover={
        !isCompressed
          ? {
              scale: 1.02,
              y: -8,
              transition: { type: 'spring', stiffness: 400, damping: 15 },
            }
          : {}
      }
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative cursor-pointer overflow-hidden rounded-xl border-2
        transition-all duration-300
        ${
          isSelected
            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-200/50'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-xl'
        }
        ${isCompressed ? 'grayscale' : ''}
      `}
    >
      {/* Glow effect on selected */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Card content */}
      <motion.div
        layout
        className={`relative p-6 ${isCompressed ? 'p-3' : 'p-6'}`}
      >
        {/* Header */}
        <motion.div layout className="mb-3 flex items-start justify-between">
          <motion.div layout>
            <motion.h3
              layout
              className={`font-bold text-gray-900 ${
                isCompressed ? 'text-sm' : 'text-xl'
              }`}
            >
              {adventure.name}
            </motion.h3>
            {!isCompressed && adventure.description && (
              <motion.p
                initial={{ opacity: 1 }}
                animate={{ opacity: isCompressed ? 0 : 1 }}
                className="mt-1 line-clamp-2 text-sm text-gray-600"
              >
                {adventure.description}
              </motion.p>
            )}
          </motion.div>

          {/* Adventure icon */}
          <motion.div
            layout
            className={`
              flex items-center justify-center rounded-lg 
              bg-gradient-to-br from-purple-500 to-indigo-600 font-bold text-white
              ${isCompressed ? 'h-10 w-10 text-sm' : 'h-14 w-14 text-xl'}
            `}
          >
            🎮
          </motion.div>
        </motion.div>

        {/* Stats */}
        {!isCompressed && (
          <motion.div
            initial={{ opacity: 1, height: 'auto' }}
            animate={{
              opacity: isCompressed ? 0 : 1,
              height: isCompressed ? 0 : 'auto',
            }}
            className="mt-4 flex gap-4 border-t border-gray-100 pt-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <div>
                <p className="text-xs text-gray-500">Players</p>
                <p className="font-semibold text-gray-900">
                  {adventure.player_count || 0}
                </p>
              </div>
            </div>

            {adventure.last_played_at && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">🕐</span>
                <div>
                  <p className="text-xs text-gray-500">Last Played</p>
                  <p className="text-xs font-medium text-gray-700">
                    {new Date(adventure.last_played_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute right-3 top-3"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
              <svg
                className="h-4 w-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Hover glow effect */}
      {!isCompressed && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          }}
        />
      )}
    </motion.div>
  )
}
