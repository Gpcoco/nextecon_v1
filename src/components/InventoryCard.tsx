// src/components/InventoryCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Inventory } from '@/contexts/GameContext'

interface InventoryCardProps {
  inventory: Inventory
  onClick: () => void
  isSelected: boolean
  isCompressed: boolean
  index: number
}

export function InventoryCard({
  inventory,
  onClick,
  isSelected,
  isCompressed,
  index,
}: InventoryCardProps) {
  const usagePercentage = inventory.inventory_capacity
    ? (inventory.current_usage / inventory.inventory_capacity) * 100
    : 0

  const getInventoryIcon = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'backpack':
        return '🎒'
      case 'equipment':
        return '⚔️'
      case 'storage':
        return '📦'
      case 'bank':
        return '🏦'
      default:
        return '💼'
    }
  }

  const getInventoryColor = (type: string | null) => {
    switch (type?.toLowerCase()) {
      case 'backpack':
        return 'from-amber-500 to-orange-600'
      case 'equipment':
        return 'from-red-500 to-rose-600'
      case 'storage':
        return 'from-blue-500 to-indigo-600'
      case 'bank':
        return 'from-green-500 to-emerald-600'
      default:
        return 'from-gray-500 to-slate-600'
    }
  }

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
            ? 'border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl shadow-amber-200/50'
            : 'border-gray-200 bg-white hover:border-amber-300 hover:shadow-lg'
        }
        ${isCompressed ? 'grayscale' : ''}
      `}
    >
      {/* Particle effect on selected */}
      {isSelected && (
        <>
          <motion.div
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-amber-400"
            initial={{ scale: 0, x: '-50%', y: '-50%' }}
            animate={{
              scale: [0, 1, 0],
              x: ['-50%', '-100%', '-150%'],
              y: ['-50%', '-100%', '-150%'],
            }}
            transition={{ duration: 0.6, delay: 0.1 }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-orange-400"
            initial={{ scale: 0, x: '-50%', y: '-50%' }}
            animate={{
              scale: [0, 1, 0],
              x: ['-50%', '0%', '50%'],
              y: ['-50%', '-100%', '-150%'],
            }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-yellow-400"
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
          className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-400/20"
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Card content */}
      <motion.div layout className={`relative ${isCompressed ? 'p-2' : 'p-6'}`}>
        {/* Inventory Icon */}
        <motion.div
          layout
          className={`
            mx-auto rounded-full bg-gradient-to-br ${getInventoryColor(
              inventory.inventory_type,
            )}
            mb-3 flex items-center justify-center font-bold text-white
            ${isCompressed ? 'h-12 w-12 text-lg' : 'h-20 w-20 text-3xl'}
          `}
        >
          {getInventoryIcon(inventory.inventory_type)}
        </motion.div>

        {/* Inventory Info */}
        <motion.div layout className="text-center">
          <motion.h3
            layout
            className={`font-bold capitalize text-gray-900 ${
              isCompressed ? 'text-xs' : 'text-lg'
            }`}
          >
            {inventory.inventory_type || 'Inventory'}
          </motion.h3>

          {!isCompressed && (
            <motion.div
              initial={{ opacity: 1, height: 'auto' }}
              animate={{
                opacity: isCompressed ? 0 : 1,
                height: isCompressed ? 0 : 'auto',
              }}
              className="mt-3 space-y-2"
            >
              {/* Capacity bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Capacity</span>
                  <span>
                    {inventory.current_usage} /{' '}
                    {inventory.inventory_capacity || 0}
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercentage}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className={`absolute h-full bg-gradient-to-r ${
                      usagePercentage > 90
                        ? 'from-red-500 to-red-600'
                        : usagePercentage > 70
                          ? 'from-amber-500 to-orange-600'
                          : 'from-green-500 to-emerald-600'
                    } rounded-full`}
                  >
                    {/* Shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Item count */}
              <div className="flex items-center justify-center gap-2 pt-1 text-sm">
                <span className="rounded-full bg-amber-100 px-3 py-1 font-medium text-amber-700">
                  {inventory.items?.length || 0} Items
                </span>
              </div>
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
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 shadow-lg">
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
