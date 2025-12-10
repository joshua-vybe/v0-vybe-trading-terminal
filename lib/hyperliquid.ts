// Hyperliquid API Service for Spot and Perps Markets
// Documentation: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api

const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz"

// Types for Hyperliquid API responses
export interface SpotToken {
  name: string
  szDecimals: number
  weiDecimals: number
  index: number
  tokenId: string
  isCanonical: boolean
}

export interface SpotMarket {
  name: string
  tokens: [number, number]
  index: number
  isCanonical: boolean
}

export interface SpotMeta {
  tokens: SpotToken[]
  universe: SpotMarket[]
}

export interface SpotAssetContext {
  dayNtlVlm: string
  markPx: string
  midPx: string
  prevDayPx: string
  circulatingSupply: string
}

export interface PerpAsset {
  name: string
  szDecimals: number
  maxLeverage: number
  onlyIsolated: boolean
}

export interface PerpMeta {
  universe: PerpAsset[]
}

export interface PerpAssetContext {
  dayNtlVlm: string
  funding: string
  impactPxs: [string, string]
  markPx: string
  midPx: string
  openInterest: string
  oraclePx: string
  premium: string
  prevDayPx: string
}

export interface Position {
  coin: string
  entryPx: string
  leverage: { type: string; value: number }
  liquidationPx: string | null
  marginUsed: string
  maxLeverage: number
  positionValue: string
  returnOnEquity: string
  szi: string
  unrealizedPnl: string
}

export interface MarginSummary {
  accountValue: string
  totalMarginUsed: string
  totalNtlPos: string
  totalRawUsd: string
}

export interface ClearinghouseState {
  assetPositions: { position: Position }[]
  crossMarginSummary: MarginSummary
  marginSummary: MarginSummary
  withdrawable: string
}

export interface SpotBalance {
  coin: string
  hold: string
  total: string
  entryNtl: string
}

export interface SpotClearinghouseState {
  balances: SpotBalance[]
}

export interface FundingHistory {
  coin: string
  fundingRate: string
  szi: string
  time: number
  usdc: string
}

export interface OrderRequest {
  coin: string
  isBuy: boolean
  sz: string
  limitPx: string
  orderType:
    | { limit: { tif: "Gtc" | "Ioc" | "Alo" } }
    | { trigger: { triggerPx: string; isMarket: boolean; tpsl: "tp" | "sl" } }
  reduceOnly: boolean
  cloid?: string
}

// API Client
class HyperliquidAPI {
  private baseUrl = HYPERLIQUID_API_URL

  private async post<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status}`)
    }
    return response.json()
  }

  // Spot Market Data
  async getSpotMeta(): Promise<SpotMeta> {
    return this.post("/info", { type: "spotMeta" })
  }

  async getSpotMetaAndAssetCtxs(): Promise<[SpotMeta, SpotAssetContext[]]> {
    return this.post("/info", { type: "spotMetaAndAssetCtxs" })
  }

  async getSpotClearinghouseState(user: string): Promise<SpotClearinghouseState> {
    return this.post("/info", { type: "spotClearinghouseState", user })
  }

  // Perps Market Data
  async getPerpMeta(): Promise<PerpMeta> {
    return this.post("/info", { type: "meta" })
  }

  async getPerpMetaAndAssetCtxs(): Promise<[PerpMeta, PerpAssetContext[]]> {
    return this.post("/info", { type: "metaAndAssetCtxs" })
  }

  async getClearinghouseState(user: string): Promise<ClearinghouseState> {
    return this.post("/info", { type: "clearinghouseState", user })
  }

  async getUserFunding(user: string, startTime: number, endTime?: number): Promise<FundingHistory[]> {
    return this.post("/info", {
      type: "userFunding",
      user,
      startTime,
      endTime: endTime || Date.now(),
    })
  }

  // All mids (prices)
  async getAllMids(): Promise<Record<string, string>> {
    return this.post("/info", { type: "allMids" })
  }

  // L2 Order Book
  async getL2Book(coin: string): Promise<{ levels: [[{ px: string; sz: string; n: number }]] }> {
    return this.post("/info", { type: "l2Book", coin })
  }

  // Recent trades
  async getRecentTrades(coin: string): Promise<{ coin: string; side: string; px: string; sz: string; time: number }[]> {
    return this.post("/info", { type: "recentTrades", coin })
  }

  // Candles
  async getCandles(
    coin: string,
    interval: string,
    startTime: number,
    endTime?: number,
  ): Promise<{ t: number; o: string; h: string; l: string; c: string; v: string }[]> {
    return this.post("/info", {
      type: "candleSnapshot",
      req: { coin, interval, startTime, endTime: endTime || Date.now() },
    })
  }

  // Funding rates history
  async getFundingHistory(
    coin: string,
    startTime: number,
    endTime?: number,
  ): Promise<{ coin: string; fundingRate: string; premium: string; time: number }[]> {
    return this.post("/info", {
      type: "fundingHistory",
      coin,
      startTime,
      endTime: endTime || Date.now(),
    })
  }
}

export const hyperliquid = new HyperliquidAPI()

// Helper functions for delta neutral calculations
export function calculateDelta(spotPosition: number, perpPosition: number): number {
  return spotPosition + perpPosition
}

export function calculateFundingPnL(fundingHistory: FundingHistory[]): number {
  return fundingHistory.reduce((acc, f) => acc + Number.parseFloat(f.usdc), 0)
}

export function calculateAnnualizedFunding(fundingRate: number): number {
  // Funding is paid every 8 hours, so multiply by 3 * 365
  return fundingRate * 3 * 365 * 100
}

export function formatFundingRate(rate: string): string {
  const rateNum = Number.parseFloat(rate) * 100
  return `${rateNum >= 0 ? "+" : ""}${rateNum.toFixed(4)}%`
}

export function getNextFundingTime(): Date {
  const now = new Date()
  const hours = now.getUTCHours()
  const nextFundingHour = Math.ceil((hours + 1) / 8) * 8
  const next = new Date(now)
  next.setUTCHours(nextFundingHour % 24, 0, 0, 0)
  if (nextFundingHour >= 24) {
    next.setUTCDate(next.getUTCDate() + 1)
  }
  return next
}

// Delta neutral strategy helpers
export interface DeltaNeutralPosition {
  asset: string
  spotSize: number
  perpSize: number
  spotEntryPrice: number
  perpEntryPrice: number
  currentSpotPrice: number
  currentPerpPrice: number
  fundingReceived: number
  spotPnL: number
  perpPnL: number
  totalPnL: number
  netDelta: number
  annualizedYield: number
}

export function calculateDeltaNeutralPnL(
  spotSize: number,
  spotEntry: number,
  spotCurrent: number,
  perpSize: number,
  perpEntry: number,
  perpCurrent: number,
  fundingReceived: number,
): { spotPnL: number; perpPnL: number; totalPnL: number } {
  const spotPnL = spotSize * (spotCurrent - spotEntry)
  const perpPnL = perpSize * (perpCurrent - perpEntry)
  const totalPnL = spotPnL + perpPnL + fundingReceived
  return { spotPnL, perpPnL, totalPnL }
}

// Market data aggregation
export interface AggregatedMarketData {
  symbol: string
  spotPrice: number | null
  perpPrice: number | null
  funding: number | null
  annualizedFunding: number | null
  openInterest: number | null
  spotVolume: number | null
  perpVolume: number | null
  maxLeverage: number | null
  premium: number | null
}

export async function getAggregatedMarketData(): Promise<AggregatedMarketData[]> {
  try {
    const [spotData, perpData] = await Promise.all([
      hyperliquid.getSpotMetaAndAssetCtxs(),
      hyperliquid.getPerpMetaAndAssetCtxs(),
    ])

    const [spotMeta, spotCtxs] = spotData
    const [perpMeta, perpCtxs] = perpData

    // Create a map of perp data
    const perpMap = new Map<string, { ctx: PerpAssetContext; asset: PerpAsset }>()
    perpMeta.universe.forEach((asset, i) => {
      perpMap.set(asset.name, { ctx: perpCtxs[i], asset })
    })

    // Create a map of spot data
    const spotMap = new Map<string, { ctx: SpotAssetContext; market: SpotMarket }>()
    spotMeta.universe.forEach((market, i) => {
      const baseName = market.name.split("/")[0]
      spotMap.set(baseName, { ctx: spotCtxs[i], market })
    })

    // Aggregate data for all perp assets (primary view)
    const aggregated: AggregatedMarketData[] = perpMeta.universe.map((asset, i) => {
      const perpCtx = perpCtxs[i]
      const spotData = spotMap.get(asset.name)

      const funding = Number.parseFloat(perpCtx.funding)
      const perpPrice = Number.parseFloat(perpCtx.markPx)
      const spotPrice = spotData ? Number.parseFloat(spotData.ctx.markPx) : null

      return {
        symbol: asset.name,
        spotPrice,
        perpPrice,
        funding,
        annualizedFunding: calculateAnnualizedFunding(funding),
        openInterest: Number.parseFloat(perpCtx.openInterest),
        spotVolume: spotData ? Number.parseFloat(spotData.ctx.dayNtlVlm) : null,
        perpVolume: Number.parseFloat(perpCtx.dayNtlVlm),
        maxLeverage: asset.maxLeverage,
        premium: Number.parseFloat(perpCtx.premium),
      }
    })

    return aggregated.sort((a, b) => Math.abs(b.annualizedFunding || 0) - Math.abs(a.annualizedFunding || 0))
  } catch (error) {
    console.error("Failed to fetch aggregated market data:", error)
    return []
  }
}
