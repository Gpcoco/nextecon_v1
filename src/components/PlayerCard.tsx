// src/components/PlayerCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Player } from '@/types/api'

interface PlayerCardProps {
  player: Player
  onClick: () => void
  isSelected: boolean
  isCompressed: boolean
  index: number
}

export function PlayerCard({
  player,
  onClick,
  isSelected,
  isCompressed,
  index,
}: PlayerCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, rotateY: 90 }}
      animate={{
        opacity: isSelected ? 1 : isCompressed ? 0.6 : 1,
        rotateY: 0,
      }}
      transition={{
        layout: { type: 'spring', stiffness: 300, damping: 30 },
        rotateY: { duration: 0.4, delay: index * 0.06 },
        opacity: { duration: 0.3 },
      }}
      style={{ perspective: 1000 }}
      whileHover={
        !isCompressed
          ? {
              scale: 1.05,
              rotateY: 5,
              rotateX: 5,
              transition: { type: 'spring', stiffness: 400, damping: 15 },
            }
          : {}
      }
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        relative cursor-pointer overflow-hidden rounded-xl border-2
        transition-all duration-300
        ${
          isSelected
            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl shadow-purple-200/50'
            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-lg'
        }
        ${isCompressed ? 'grayscale' : ''}
      `}
    >
      {/* Particle effect on selected */}
      {isSelected && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-yellow-400"
            initial={{ scale: 0, x: '-50%', y: '-50%' }}
            animate={{
              scale: [0, 1, 0],
              x: ['-50%', '-100%', '-150%'],
              y: ['-50%', '-100%', '-150%'],
            }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-blue-400"
            initial={{ scale: 0, x: '-50%', y: '-50%' }}
            animate={{
              scale: [0, 1, 0],
              x: ['-50%', '0%', '50%'],
              y: ['-50%', '-100%', '-150%'],
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-pink-400"
            initial={{ scale: 0, x: '-50%', y: '-50%' }}
            animate={{
              scale: [0, 1, 0],
              x: ['-50%', '50%', '100%'],
              y: ['-50%', '-50%', '-100%'],
            }}
            transition={{ duration: 0.6, delay: 0.15 }}
          />
        </>
      )}

      {/* Glow pulse */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Card content */}
      <motion.div layout className={`relative ${isCompressed ? 'p-2' : 'p-6'}`}>
        {/* Character Avatar */}
        <motion.div
          layout
          className={`
            mx-auto mb-3 flex items-center justify-center
            rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 font-bold text-white
            ${isCompressed ? 'h-12 w-12 text-lg' : 'h-20 w-20 text-3xl'}
          `}
        >
          {player.role_name ? player.role_name.charAt(0).toUpperCase() : '⚔️'}
        </motion.div>

        {/* Player Info */}
        <motion.div layout className="text-center">
          <motion.h3
            layout
            className={`font-bold text-gray-900 ${
              isCompressed ? 'text-xs' : 'text-lg'
            }`}
          >
            {player.role_name || 'Unnamed Character'}
          </motion.h3>

          {!isCompressed && (
            <motion.div
              initial={{ opacity: 1, height: 'auto' }}
              animate={{
                opacity: isCompressed ? 0 : 1,
                height: isCompressed ? 0 : 'auto',
              }}
              className="mt-2 space-y-1"
            >
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="rounded-full bg-blue-100 px-2 py-1 font-medium text-blue-700">
                  Lv {player.level || 1}
                </span>
                {player.xp_total !== null && (
                  <span className="text-xs text-gray-500">
                    {player.xp_total} XP
                  </span>
                )}
              </div>

              {player.house_name && (
                <p className="mt-1 text-xs text-gray-600">
                  🏰 {player.house_name}
                </p>
              )}

              {/* Show additional info when selected but not compressed */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 space-y-2 border-t border-gray-200 pt-3"
                >
                  {player.region && (
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                      <span>📍</span>
                      <span>{player.region}</span>
                    </div>
                  )}
                  {player.join_date && (
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
                      <span>📅</span>
                      <span>
                        Joined {new Date(player.join_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Selected indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="absolute right-2 top-2"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 shadow-lg">
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
    </motion.div>
  )
}

// Empty card for creating new player
export function EmptyPlayerCard({ disabled = true }: { disabled?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 90 }}
      animate={{ opacity: 0.5, rotateY: 0 }}
      transition={{ rotateY: { duration: 0.4, delay: 0.3 } }}
      className={`
        relative flex items-center justify-center overflow-hidden rounded-xl
        border-2 border-dashed border-gray-300 bg-gray-50
        ${
          disabled
            ? 'cursor-not-allowed'
            : 'cursor-pointer hover:border-gray-400 hover:bg-gray-100'
        }
        transition-all duration-300
      `}
      style={{ minHeight: '200px' }}
    >
      <div className="p-6 text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-3xl"
        >
          ➕
        </motion.div>
        <p className="font-medium text-gray-500">Create New Character</p>
        {disabled && (
          <p className="mt-1 text-xs text-gray-400">(Coming Soon)</p>
        )}
      </div>
    </motion.div>
  )
}
