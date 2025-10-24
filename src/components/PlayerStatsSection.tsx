// src/components/PlayerStatsSection.tsx
'use client'

import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Player } from '@/types/api'

interface PlayerStatsSectionProps {
  player: Player
}

// Animated counter component
function AnimatedCounter({ value, label }: { value: number; label: string }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const controls = animate(count, value, { duration: 1, ease: 'easeOut' })
    const unsubscribe = rounded.on('change', (latest) =>
      setDisplayValue(latest),
    )

    return () => {
      controls.stop()
      unsubscribe()
    }
  }, [value, count, rounded])

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-center"
    >
      <motion.div
        className="text-3xl font-bold text-gray-900"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
      >
        {displayValue}
      </motion.div>
      <p className="mt-1 text-sm text-gray-600">{label}</p>
    </motion.div>
  )
}

// Animated progress bar
function AnimatedProgressBar({
  current,
  max,
  label,
  color = 'blue',
  delay = 0,
}: {
  current: number
  max: number
  label: string
  color?: 'blue' | 'purple' | 'green'
  delay?: number
}) {
  const percentage = Math.min((current / max) * 100, 100)

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">
          {current} / {max}
        </span>
      </div>
      <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay + 0.2, ease: 'easeOut' }}
          className={`absolute h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
        >
          {/* Shine effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

// Stat attribute display
function StatAttribute({
  icon,
  label,
  value,
  delay = 0,
}: {
  icon: string
  label: string
  value: number
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05 }}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
      </div>
    </motion.div>
  )
}

export function PlayerStatsSection({ player }: PlayerStatsSectionProps) {
  // Mock stats - you'll replace these with actual data from your API
  const stats = {
    hp: { current: 85, max: 100 },
    mana: { current: 60, max: 80 },
    strength: 15,
    dexterity: 12,
    intelligence: 18,
    wisdom: 14,
    charisma: 10,
    constitution: 13,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay: 0.2,
      }}
      className="space-y-6"
    >
      {/* Character Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-8 text-white"
      >
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
          style={{
            backgroundImage:
              'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative flex items-center gap-6">
          {/* Character avatar */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/30 bg-white/20 text-4xl font-bold backdrop-blur-sm"
          >
            {player.role_name ? player.role_name.charAt(0).toUpperCase() : '⚔️'}
          </motion.div>

          <div className="flex-1">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-2 text-3xl font-bold"
            >
              {player.role_name || 'Unnamed Character'}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                Level {player.level || 1}
              </span>
              {player.house_name && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                  🏰 {player.house_name}
                </span>
              )}
              {player.region && (
                <span className="rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
                  📍 {player.region}
                </span>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.3,
            },
          },
        }}
        className="grid grid-cols-2 gap-4 md:grid-cols-4"
      >
        <AnimatedCounter value={player.level || 1} label="Level" />
        <AnimatedCounter value={player.xp_total || 0} label="Total XP" />
        <AnimatedCounter value={0} label="Quests" />
        <AnimatedCounter value={0} label="Achievements" />
      </motion.div>

      {/* Health and Mana Bars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="space-y-4 rounded-xl bg-white p-6 shadow-lg"
      >
        <h3 className="mb-4 text-lg font-bold text-gray-900">Resources</h3>
        <AnimatedProgressBar
          current={stats.hp.current}
          max={stats.hp.max}
          label="Health Points"
          color="green"
          delay={0.6}
        />
        <AnimatedProgressBar
          current={stats.mana.current}
          max={stats.mana.max}
          label="Mana Points"
          color="blue"
          delay={0.7}
        />
      </motion.div>

      {/* Character Attributes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl bg-white p-6 shadow-lg"
      >
        <h3 className="mb-4 text-lg font-bold text-gray-900">Attributes</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatAttribute
            icon="💪"
            label="Strength"
            value={stats.strength}
            delay={0.9}
          />
          <StatAttribute
            icon="🎯"
            label="Dexterity"
            value={stats.dexterity}
            delay={0.95}
          />
          <StatAttribute
            icon="🧠"
            label="Intelligence"
            value={stats.intelligence}
            delay={1.0}
          />
          <StatAttribute
            icon="🔮"
            label="Wisdom"
            value={stats.wisdom}
            delay={1.05}
          />
          <StatAttribute
            icon="💬"
            label="Charisma"
            value={stats.charisma}
            delay={1.1}
          />
          <StatAttribute
            icon="❤️"
            label="Constitution"
            value={stats.constitution}
            delay={1.15}
          />
        </div>
      </motion.div>

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6"
      >
        <h3 className="mb-4 text-lg font-bold text-gray-900">
          📊 Activity Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">0</p>
            <p className="text-sm text-gray-600">Quests Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">0</p>
            <p className="text-sm text-gray-600">PvP Victories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-600">0</p>
            <p className="text-sm text-gray-600">Events Joined</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
