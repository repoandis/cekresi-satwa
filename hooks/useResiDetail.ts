import { useState, useEffect } from 'react'

interface ResiDetailData {
  kodeResi: string
  satwa: any
}

export function useResiDetail() {
  const [resiDetail, setResiDetail] = useState<ResiDetailData | null>(null)

  const showDetail = (kodeResi: string, satwa: any) => {
    setResiDetail({ kodeResi, satwa })
  }

  const clearDetail = () => {
    setResiDetail(null)
  }

  return {
    resiDetail,
    showDetail,
    clearDetail
  }
}
