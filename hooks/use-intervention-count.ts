"use client"

import { useState, useEffect, useCallback } from 'react'

interface InterventionCount {
  totalActions: number
  todayActions: number
  isLoading: boolean
  error: string | null
}

export function useInterventionCount(parentId: string | undefined) {
  const [interventionCount, setInterventionCount] = useState<InterventionCount>({
    totalActions: 0,
    todayActions: 0,
    isLoading: false,
    error: null
  })

  const fetchInterventionCount = useCallback(async () => {
    if (!parentId) {
      setInterventionCount(prev => ({
        ...prev,
        error: 'Parent ID is required'
      }))
      return
    }

    setInterventionCount(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/parent/actions?parentId=${parentId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setInterventionCount({
          totalActions: data.totalActions || 0,
          todayActions: data.todayActions || 0,
          isLoading: false,
          error: null
        })
      } else {
        throw new Error(data.error || 'Failed to fetch intervention count')
      }
    } catch (error) {
      console.error('Error fetching intervention count:', error)
      setInterventionCount(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }))
    }
  }, [parentId])

  // Load initial data
  useEffect(() => {
    fetchInterventionCount()
  }, [fetchInterventionCount])

  // Listen for intervention updates
  useEffect(() => {
    const handleInterventionAdded = () => {
      fetchInterventionCount()
    }

    window.addEventListener('interventionAdded', handleInterventionAdded)
    
    return () => {
      window.removeEventListener('interventionAdded', handleInterventionAdded)
    }
  }, [fetchInterventionCount])

  return {
    ...interventionCount,
    refetch: fetchInterventionCount
  }
}