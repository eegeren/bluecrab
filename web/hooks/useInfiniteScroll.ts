import { useCallback, useEffect, useRef, useState } from 'react'

export function useInfiniteScroll<T>(
  fetcher: (page: number) => Promise<T[]>,
  pageSize = 20
) {
  const [items, setItems] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    setPage(1)
    try {
      const data = await fetcher(1)
      setItems(data)
      setHasMore(data.length >= pageSize)
    } catch (err) {
      setItems([])
      setHasMore(false)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [fetcher, pageSize])

  // Initial load and refetch when fetcher changes.
  useEffect(() => {
    reload()
  }, [reload])

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const next = await fetcher(page + 1)
      setItems(prev => [...prev, ...next])
      setPage(p => p + 1)
      setHasMore(next.length >= pageSize)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoadingMore(false)
    }
  }, [fetcher, page, hasMore, loadingMore, pageSize])

  // Intersection observer
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore() },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  const prepend = (item: T) => setItems(prev => [item, ...prev])
  const remove = (predicate: (item: T) => boolean) =>
    setItems(prev => prev.filter(i => !predicate(i)))

  return { items, setItems, loading, loadingMore, hasMore, error, sentinelRef, prepend, remove, reload }
}

