// src/components/ItemCard.tsx
'use client'

import { motion } from 'framer-motion'
import { Item } from '@/contexts/GameContext'

interface ItemCardProps {
  item: Item
  index: number
}

export function ItemCard({ item, index }: ItemCardProps) {
  const getRarityColor = (rarity: string | null) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return {
          bg: 'from-orange-500 to-red-600',
          border: 'border-orange-500',
          text: 'text-orange-600',
          glow: 'shadow-orange-200/50',
        }
      case 'epic':
        return {
          bg: 'from-purple-500 to-indigo-600',
          border: 'border-purple-500',
          text: 'text-purple-600',
          glow: 'shadow-purple-200/50',
        }
      case 'rare':
        return {
          bg: 'from-blue-500 to-cyan-600',
          border: 'border-blue-500',
          text: 'text-blue-600',
          glow: 'shadow-blue-200/50',
        }
      case 'uncommon':
        return {
          bg: 'from-green-500 to-emerald-600',
          border: 'border-green-500',
          text: 'text-green-600',
          glow: 'shadow-green-200/50',
        }
      case 'common':
      default:
        return {
          bg: 'from-gray-500 to-slate-600',
          border: 'border-gray-400',
          text: 'text-gray-600',
          glow: 'shadow-gray-200/50',
        }
    }
  }

  const getCategoryIcon = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case 'weapon':
        return '⚔️'
      case 'armor':
        return '🛡️'
      case 'potion':
        return '🧪'
      case 'food':
        return '🍖'
      case 'material':
        return '📦'
      case 'key':
        return '🔑'
      case 'quest':
        return '📜'
      case 'consumable':
        return '💊'
      default:
        return '📦'
    }
  }

  const colors = getRarityColor(item.item_rarity)

  return (
    <motion.div
      initial={{ opacity: 0, rotateY: 90, scale: 0.8 }}
      animate={{
        opacity: 1,
        rotateY: 0,
        scale: 1,
      }}
      transition={{
        rotateY: { duration: 0.4, delay: index * 0.05 },
        scale: { duration: 0.3, delay: index * 0.05 },
        opacity: { duration: 0.3, delay: index * 0.05 },
      }}
      style={{ perspective: 1000 }}
      whileHover={{
        scale: 1.05,
        rotateY: 5,
        rotateX: 5,
        transition: { type: 'spring', stiffness: 400, damping: 15 },
      }}
      className={`
        relative overflow-hidden rounded-xl border-2 ${colors.border}
        bg-white hover:shadow-xl ${colors.glow}
        cursor-pointer transition-all duration-300
      `}
    >
      {/* Rarity glow effect */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-r ${colors.bg} opacity-10`}
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Special key indicator */}
      {item.is_city_key && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.3 }}
          className="absolute right-2 top-2 z-10"
        >
          <div className="flex items-center gap-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-bold text-white">
            <span>🏙️</span>
            <span>City Key</span>
          </div>
        </motion.div>
      )}

      {/* Card content */}
      <div className="relative p-4">
        {/* Item Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 15,
            delay: index * 0.05 + 0.2,
          }}
          className={`
            mx-auto mb-3 h-16 w-16 rounded-full 
            bg-gradient-to-br ${colors.bg}
            flex items-center justify-center text-3xl
            shadow-lg
          `}
        >
          {getCategoryIcon(item.item_category)}
        </motion.div>

        {/* Item Name */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + 0.3 }}
          className={`text-center font-bold ${colors.text} mb-2 line-clamp-2 text-sm`}
        >
          {item.item_name}
        </motion.h3>

        {/* Item Description */}
        {item.item_description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.05 + 0.4 }}
            className="mb-3 line-clamp-2 text-center text-xs text-gray-600"
          >
            {item.item_description}
          </motion.p>
        )}

        {/* Item Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 + 0.5 }}
          className="space-y-2 border-t border-gray-100 pt-3"
        >
          {/* Quantity and Rarity */}
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
              x{item.quantity}
            </span>
            {item.item_rarity && (
              <span
                className={`rounded-full bg-gradient-to-r px-2 py-1 ${colors.bg} text-xs font-medium capitalize text-white`}
              >
                {item.item_rarity}
              </span>
            )}
          </div>

          {/* Durability Bar */}
          {item.durability !== null && item.durability >= 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Durability</span>
                <span>{item.durability}%</span>
              </div>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.durability}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 + 0.6 }}
                  className={`absolute h-full rounded-full ${
                    item.durability > 70
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                      : item.durability > 40
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                        : 'bg-gradient-to-r from-red-500 to-rose-600'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Value */}
          {item.item_base_value !== null && (
            <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
              <span>💰</span>
              <span className="font-medium">{item.item_base_value}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Hover glow effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at center, ${
            colors.bg.includes('orange')
              ? 'rgba(249, 115, 22, 0.1)'
              : 'rgba(59, 130, 246, 0.1)'
          } 0%, transparent 70%)`,
        }}
      />
    </motion.div>
  )
}

// Empty state component
export function EmptyItemsState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full flex flex-col items-center justify-center px-4 py-16"
    >
      <motion.div
        animate={{
          rotate: [0, 5, -5, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-gray-200 to-gray-300 text-5xl"
      >
        📭
      </motion.div>
      <h3 className="mb-2 text-xl font-bold text-gray-900">No Items Found</h3>
      <p className="max-w-md text-center text-gray-600">
        This inventory is empty. Start your adventure to collect items!
      </p>
    </motion.div>
  )
}
