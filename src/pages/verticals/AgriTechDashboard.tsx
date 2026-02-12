import { useMemo } from 'react';
import { useVerticalApi } from '../../hooks/useVerticalApi';
import VerticalPageLayout from '../../components/layout/VerticalPageLayout';
import { Card } from '../../components/ui/Card';
import { Wind, Droplets, Sun, Thermometer } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeatherData {
    current_weather: {
        temperature: number;
        windspeed: number;
        winddirection: number;
        weathercode: number;
        time: string;
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        relativehumidity_2m: number[];
        windspeed_10m: number[];
    };
}

const AgriTechDashboard = () => {
    // Default location: Berlin (Example farm location)
    const { data, loading, metrics, refetch } = useVerticalApi<WeatherData>({
        endpoint: 'https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m',
        pollingInterval: 300000, // Update every 5 minutes
    });

    const chartData = useMemo(() => {
        if (!data?.hourly) return [];
        // Take next 24 hours
        return data.hourly.time.slice(0, 24).map((time, i) => ({
            time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            temp: data.hourly.temperature_2m[i],
            humidity: data.hourly.relativehumidity_2m[i],
            wind: data.hourly.windspeed_10m[i]
        }));
    }, [data]);

    return (
        <VerticalPageLayout
            title="Smart Farming Environmental Monitor"
            industry="Agri-Tech"
            apiSource="Open-Meteo API"
            metrics={metrics}
            loading={loading}
            onRefresh={refetch}
        >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card className="bg-green-50 border-green-100 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-200 rounded-lg text-green-700">
                            <Thermometer size={20} />
                        </div>
                        <span className="text-sm font-medium text-green-800">Temperature</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {data?.current_weather?.temperature ?? '--'}°C
                    </p>
                </Card>

                <Card className="bg-blue-50 border-blue-100 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-200 rounded-lg text-blue-700">
                            <Wind size={20} />
                        </div>
                        <span className="text-sm font-medium text-blue-800">Wind Speed</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {data?.current_weather?.windspeed ?? '--'} km/h
                    </p>
                </Card>

                <Card className="bg-indigo-50 border-indigo-100 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-200 rounded-lg text-indigo-700">
                            <Droplets size={20} />
                        </div>
                        <span className="text-sm font-medium text-indigo-800">Soil Moisture Est.</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {data ? '64%' : '--'} 
                    </p>
                </Card>

                <Card className="bg-amber-50 border-amber-100 p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-200 rounded-lg text-amber-700">
                            <Sun size={20} />
                        </div>
                        <span className="text-sm font-medium text-amber-800">UV Index</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {data ? 'Moderate' : '--'}
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <div className="px-6 py-4 border-b border-gray-100 font-bold text-lg">
                        24-Hour Forecast
                    </div>
                    <div className="p-6 h-[300px] w-full">
                        {loading && !data ? (
                            <div className="h-full flex items-center justify-center text-gray-400">Loading Chart...</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis dataKey="time" tick={{fontSize: 12}} interval={3} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#10b981" />
                                    <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                                    <Tooltip />
                                    <Line yAxisId="left" type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={2} dot={false} name="Temp (°C)" />
                                    <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#3b82f6" strokeWidth={2} dot={false} name="Humidity (%)" />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <Card>
                    <div className="px-6 py-4 border-b border-gray-100 font-bold text-lg">
                        Crop Health Status
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-medium text-gray-700">Wheat Field A</span>
                            </div>
                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Optimal</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                                <span className="font-medium text-gray-700">Corn Field B</span>
                            </div>
                            <span className="text-sm text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Irrigation Needed</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="font-medium text-gray-700">Soybean Plot C</span>
                            </div>
                            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">Optimal</span>
                        </div>
                    </div>
                </Card>
            </div>
        </VerticalPageLayout>
    );
};

export default AgriTechDashboard;
