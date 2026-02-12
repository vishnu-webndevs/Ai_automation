import { useVerticalApi } from '../../hooks/useVerticalApi';
import VerticalPageLayout from '../../components/layout/VerticalPageLayout';
import { Card } from '../../components/ui/Card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface CoinData {
    id: string;
    symbol: string;
    name: string;
    image: string;
    current_price: number;
    market_cap: number;
    market_cap_rank: number;
    price_change_percentage_24h: number;
    total_volume: number;
}

const FintechDashboard = () => {
    const { data, loading, error, metrics, refetch } = useVerticalApi<CoinData[]>({
        endpoint: 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false',
        pollingInterval: 60000, // Update every minute
    });

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: val < 1 ? 4 : 2
        }).format(val);
    };

    const formatLargeNumber = (val: number) => {
        if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
        if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
        return formatCurrency(val);
    };

    return (
        <VerticalPageLayout
            title="Crypto Market Real-time Tracker"
            industry="Fintech"
            apiSource="CoinGecko Public API"
            metrics={metrics}
            loading={loading}
            onRefresh={refetch}
        >
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <TrendingDown size={20} />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white !border-0 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Market Leader</p>
                            <h3 className="text-2xl font-bold">{data?.[0]?.name || 'Loading...'}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                        <span className="text-3xl font-bold">
                            {data?.[0] ? formatCurrency(data[0].current_price) : '---'}
                        </span>
                        {data?.[0] && (
                            <span className={`flex items-center text-sm font-medium px-2 py-0.5 rounded ${
                                data[0].price_change_percentage_24h >= 0 ? 'bg-green-400/30 text-white' : 'bg-red-400/30 text-white'
                            }`}>
                                {data[0].price_change_percentage_24h >= 0 ? '+' : ''}
                                {data[0].price_change_percentage_24h.toFixed(2)}%
                            </span>
                        )}
                    </div>
                </Card>

                <Card className="bg-white border-gray-200 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium mb-1">Top Volume (24h)</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {data ? data.sort((a,b) => b.total_volume - a.total_volume)[0].name : '---'}
                            </h3>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <span className="text-2xl font-bold text-gray-900">
                            {data ? formatLargeNumber(data.sort((a,b) => b.total_volume - a.total_volume)[0].total_volume) : '---'}
                        </span>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="px-6 py-4 border-b border-gray-100 font-bold text-lg">
                    Top 10 Cryptocurrencies by Market Cap
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                                <th className="p-4 font-medium">Rank</th>
                                <th className="p-4 font-medium">Asset</th>
                                <th className="p-4 font-medium text-right">Price</th>
                                <th className="p-4 font-medium text-right">24h Change</th>
                                <th className="p-4 font-medium text-right">Market Cap</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm text-gray-700">
                            {loading && !data ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-8"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-20 ml-auto"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-16 ml-auto"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-100 rounded w-24 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : (
                                data?.map((coin) => (
                                    <tr key={coin.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-500">#{coin.market_cap_rank}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{coin.name}</p>
                                                    <p className="text-xs text-gray-500 uppercase">{coin.symbol}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right font-medium">
                                            {formatCurrency(coin.current_price)}
                                        </td>
                                        <td className="p-4 text-right">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                coin.price_change_percentage_24h >= 0 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {coin.price_change_percentage_24h >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                                            </span>
                                        </td>
                                        <td className="p-4 text-right text-gray-500">
                                            {formatLargeNumber(coin.market_cap)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </VerticalPageLayout>
    );
};

export default FintechDashboard;
