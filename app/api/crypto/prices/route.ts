import { NextResponse } from "next/server"

// CoinGecko API endpoint
const COINGECKO_API_URL = "https://api.coingecko.com/api/v3"

// Map our internal crypto IDs to CoinGecko IDs
const COIN_MAP: { [key: string]: string } = {
  bitcoin: "bitcoin",
  ethereum: "ethereum",
  tron: "tron",
  solana: "solana",
  gala: "gala",
  doge: "dogecoin",
  ripple: "ripple",
  usdt: "tether",
  usdc: "usd-coin",
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const coinIds = searchParams.get("ids") || Object.values(COIN_MAP).join(",")

    // Fetch prices and market data from CoinGecko (includes images)
    const [priceResponse, marketResponse] = await Promise.all([
      fetch(
        `${COINGECKO_API_URL}/simple/price?ids=${coinIds}&vs_currencies=usd&include_24hr_change=true`,
        {
          headers: {
            "Accept": "application/json",
          },
          next: { revalidate: 60 }, // Cache for 60 seconds
        }
      ),
      fetch(
        `${COINGECKO_API_URL}/coins/markets?ids=${coinIds}&vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false`,
        {
          headers: {
            "Accept": "application/json",
          },
          next: { revalidate: 60 },
        }
      )
    ])

    if (!priceResponse.ok || !marketResponse.ok) {
      throw new Error(`CoinGecko API error: ${priceResponse.status}`)
    }

    const priceData = await priceResponse.json()
    const marketData = await marketResponse.json()

    // Create a map of coin IDs to market data (for images)
    const marketMap = new Map<string, any>()
    marketData.forEach((coin: any) => {
      marketMap.set(coin.id, coin)
    })

    // Transform CoinGecko data to our format
    const transformedData: { [key: string]: { price: number; change24h: number; image?: string } } = {}

    Object.entries(COIN_MAP).forEach(([internalId, coingeckoId]) => {
      const coinPriceData = priceData[coingeckoId]
      const coinMarketData = marketMap.get(coingeckoId)
      
      if (coinPriceData) {
        transformedData[internalId] = {
          price: coinPriceData.usd || 0,
          change24h: coinPriceData.usd_24h_change || 0,
          image: coinMarketData?.image || undefined,
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedData,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error fetching crypto prices:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch crypto prices",
      },
      { status: 500 }
    )
  }
}

