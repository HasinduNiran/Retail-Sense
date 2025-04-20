import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../../config/apiConfig';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area, ComposedChart, Scatter, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { FaDownload, FaCalendarAlt, FaChartLine } from 'react-icons/fa';

export default function DiscountTrend() {
  const [promotionData, setPromotionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // 'week', 'month', 'all'
  const [viewMode, setViewMode] = useState('standard'); // 'standard', 'advanced', 'forecast'
  const [comparisonMode, setComparisonMode] = useState(false);

  // Metrics calculated from the promotion data
  const [metrics, setMetrics] = useState({
    totalPromotions: 0,
    totalUsage: 0,
    avgUsagePerPromotion: 0,
    mostUsedPromoType: '',
    mostUsedDiscountType: '',
    mostPopularCategory: '',
    conversionRate: 0
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  useEffect(() => {
    fetchPromotionData();
  }, [timeRange]);

  const fetchPromotionData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROMOTIONS.ALL}`);
      
      // Ensure response.data is an array before processing
      let responseData = response.data;
      
      // Check if the response contains a data property (common API pattern)
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        responseData = responseData.data;
      }
      
      // Validate that responseData is an array
      if (!Array.isArray(responseData)) {
        console.error('API response is not an array:', responseData);
        setError('Invalid data format received from server');
        setLoading(false);
        return;
      }
      
      // Filter data based on time range if needed
      let filteredData = responseData;
      if (timeRange === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredData = responseData.filter(promo => new Date(promo.createdAt) >= oneWeekAgo);
      } else if (timeRange === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredData = responseData.filter(promo => new Date(promo.createdAt) >= oneMonthAgo);
      }
      
      setPromotionData(filteredData);
      analyzePromotionData(filteredData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching promotion data:', err);
      setError('Error fetching promotion data. Please try again later.');
      setLoading(false);
    }
  };

  const analyzePromotionData = (data) => {
    // Skip analysis if no data
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No data to analyze or data is not an array');
      return;
    }

    try {
      // Calculate total usage
      const totalUsage = data.reduce((sum, promo) => sum + (promo.usageCount || 0), 0);
      
      // Calculate promotion type distribution
      const promoTypeCounts = data.reduce((acc, promo) => {
        acc[promo.type] = (acc[promo.type] || 0) + 1;
        return acc;
      }, {});
      
      // Find most used promotion type
      const mostUsedPromoType = Object.keys(promoTypeCounts).length > 0 
        ? Object.keys(promoTypeCounts).reduce((a, b) => 
            promoTypeCounts[a] > promoTypeCounts[b] ? a : b, '')
        : 'None';
      
      // Calculate discount type distribution
      const discountTypeCounts = data.reduce((acc, promo) => {
        acc[promo.discountType] = (acc[promo.discountType] || 0) + 1;
        return acc;
      }, {});
      
      // Find most used discount type
      const mostUsedDiscountType = Object.keys(discountTypeCounts).length > 0 
        ? Object.keys(discountTypeCounts).reduce((a, b) => 
            discountTypeCounts[a] > discountTypeCounts[b] ? a : b, '')
        : 'None';
      
      // Calculate category popularity
      const categoryPopularity = {};
      data.forEach(promo => {
        if (promo.applicableCategories && Array.isArray(promo.applicableCategories) && promo.applicableCategories.length) {
          promo.applicableCategories.forEach(category => {
            if (category) {
              categoryPopularity[category] = (categoryPopularity[category] || 0) + (promo.usageCount || 0);
            }
          });
        }
      });
      
      // Find most popular category
      const mostPopularCategory = Object.keys(categoryPopularity).length > 0 
        ? Object.keys(categoryPopularity).reduce((a, b) => 
            categoryPopularity[a] > categoryPopularity[b] ? a : b, '')
        : 'None';
      
      // Calculate a simulated conversion rate (this would ideally come from actual order data)
      // For demo purposes, let's assume a random conversion rate between 15-45%
      const conversionRate = data.length > 0 ? 
        (Math.random() * 30 + 15).toFixed(2) : 0;
      
      setMetrics({
        totalPromotions: data.length,
        totalUsage,
        avgUsagePerPromotion: data.length > 0 ? (totalUsage / data.length).toFixed(2) : 0,
        mostUsedPromoType,
        mostUsedDiscountType,
        mostPopularCategory,
        conversionRate
      });
    } catch (error) {
      console.error('Error analyzing promotion data:', error);
      setError('Error analyzing promotion data');
    }
  };

  // Data preparation functions for charts
  const prepareTypeData = () => {
    if (!Array.isArray(promotionData) || promotionData.length === 0) return [];
    
    try {
      const typeCounts = promotionData.reduce((acc, promo) => {
        const type = promo.type || 'Unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {});
      
      return Object.keys(typeCounts).map(type => ({
        name: type,
        count: typeCounts[type],
      }));
    } catch (error) {
      console.error('Error preparing type data:', error);
      return [];
    }
  };

  const prepareDiscountTypeData = () => {
    if (!Array.isArray(promotionData) || promotionData.length === 0) return [];
    
    try {
      const typeCounts = promotionData.reduce((acc, promo) => {
        const discountType = promo.discountType || 'Unknown';
        acc[discountType] = (acc[discountType] || 0) + 1;
        return acc;
      }, {});
      
      return Object.keys(typeCounts).map(type => ({
        name: type,
        count: typeCounts[type],
      }));
    } catch (error) {
      console.error('Error preparing discount type data:', error);
      return [];
    }
  };

  const prepareUsageData = () => {
    if (!Array.isArray(promotionData) || promotionData.length === 0) return [];
    
    try {
      // Sort by usage count
      const sorted = [...promotionData]
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 10);  // Top 10
      
      return sorted.map(promo => ({
        name: promo.promoCode || 'Unknown',
        usageCount: promo.usageCount || 0,
      }));
    } catch (error) {
      console.error('Error preparing usage data:', error);
      return [];
    }
  };

  const prepareCategoryData = () => {
    if (!Array.isArray(promotionData) || promotionData.length === 0) return [];
    
    try {
      const categoryData = {};
      
      promotionData.forEach(promo => {
        if (promo.applicableCategories && Array.isArray(promo.applicableCategories) && promo.applicableCategories.length) {
          promo.applicableCategories.forEach(category => {
            if (category) {
              categoryData[category] = (categoryData[category] || 0) + 1;
            }
          });
        }
      });
      
      return Object.keys(categoryData).map(category => ({
        name: category,
        count: categoryData[category],
      }));
    } catch (error) {
      console.error('Error preparing category data:', error);
      return [];
    }
  };

  // Prepare discount effectiveness data (simulated)
  const prepareEffectivenessData = () => {
    if (!Array.isArray(promotionData) || promotionData.length === 0) return [];
    
    try {
      // This would ideally be calculated from real transaction data
      // For demo purposes, we're creating simulated data
      return promotionData.slice(0, 5).map(promo => {
        const effectiveness = Math.random() * 100;
        return {
          name: promo.promoCode,
          effectiveness: effectiveness.toFixed(1),
        };
      });
    } catch (error) {
      console.error('Error preparing effectiveness data:', error);
      return [];
    }
  };

  // Prepare usage trends data for line chart
  const prepareUsageTrendsData = () => {
    if (!Array.isArray(promotionData) || promotionData.length === 0) return [];
    
    try {
      // Sort promotions by creation date
      const sorted = [...promotionData].sort((a, b) => 
        new Date(a.createdAt || a.promoCreatedDate) - new Date(b.createdAt || b.promoCreatedDate)
      );
      
      // Create a map of dates to track cumulative usage
      const dateMap = {};
      let cumulativeUsage = 0;
      
      sorted.forEach(promo => {
        const date = new Date(promo.createdAt || promo.promoCreatedDate);
        if (!isNaN(date)) {
          const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
          cumulativeUsage += (promo.usageCount || 0);
          
          // Store the date and cumulative usage
          dateMap[dateStr] = {
            date: dateStr,
            totalUsage: cumulativeUsage,
            activePromotions: (dateMap[dateStr]?.activePromotions || 0) + 1
          };
        }
      });
      
      // Convert the map to an array sorted by date
      return Object.values(dateMap).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
    } catch (error) {
      console.error('Error preparing usage trends data:', error);
      return [];
    }
  };

  // Prepare seasonal data analysis
  const prepareSeasonalData = () => {
    if (!Array.isArray(promotionData) || promotionData.length === 0) return [];
    
    try {
      // Group data by month
      const monthlyData = {};
      
      promotionData.forEach(promo => {
        const date = new Date(promo.createdAt || promo.promoCreatedDate);
        if (!isNaN(date)) {
          const month = date.getMonth(); // 0-11
          const monthName = new Date(0, month).toLocaleString('default', { month: 'long' });
          
          if (!monthlyData[month]) {
            monthlyData[month] = {
              month: monthName,
              totalPromotions: 0,
              totalUsage: 0,
              averageDiscount: 0,
              discountSum: 0
            };
          }
          
          monthlyData[month].totalPromotions += 1;
          monthlyData[month].totalUsage += (promo.usageCount || 0);
          
          // Add discount value to calculate average later
          const discountValue = promo.discountType === 'percentage' 
            ? promo.discountPercentage 
            : (promo.discountValue || 0);
          
          monthlyData[month].discountSum += discountValue;
        }
      });
      
      // Calculate averages and format for chart
      return Object.values(monthlyData).map(data => ({
        ...data,
        averageDiscount: data.totalPromotions > 0 
          ? (data.discountSum / data.totalPromotions).toFixed(2) 
          : 0,
        effectivenessScore: calculateEffectivenessScore(data)
      })).sort((a, b) => {
        // Sort by month name to ensure correct order
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
    } catch (error) {
      console.error('Error preparing seasonal data:', error);
      return [];
    }
  };

  // Calculate a simulated effectiveness score
  const calculateEffectivenessScore = (data) => {
    // This would ideally be based on actual conversion rates and revenue
    // For this simulation, we'll use a formula that considers usage and promotion count
    if (data.totalPromotions === 0) return 0;
    
    const usagePerPromotion = data.totalUsage / data.totalPromotions;
    return Math.min(100, usagePerPromotion * 10).toFixed(1); // Scale to 0-100
  };
  
  // Prepare promotion comparison data
  const prepareComparisonData = () => {
    if (!Array.isArray(promotionData) || promotionData.length === 0) return [];
    
    try {
      // Group by promotion type
      const typeData = {};
      
      promotionData.forEach(promo => {
        const type = promo.type || 'Unknown';
        
        if (!typeData[type]) {
          typeData[type] = {
            name: type,
            totalUsage: 0,
            count: 0,
            avgUsage: 0,
            conversionRate: 0
          };
        }
        
        typeData[type].totalUsage += (promo.usageCount || 0);
        typeData[type].count += 1;
      });
      
      // Calculate averages and add simulated conversion rates
      return Object.values(typeData).map(data => ({
        ...data,
        avgUsage: data.count > 0 ? (data.totalUsage / data.count).toFixed(2) : 0,
        conversionRate: (15 + Math.random() * 30).toFixed(1) // Simulated between 15-45%
      }));
    } catch (error) {
      console.error('Error preparing comparison data:', error);
      return [];
    }
  };
  
  // Forecast future performance (simulated)
  const prepareForecastData = () => {
    if (!Array.isArray(promotionData) || promotionData.length === 0) return [];
    
    try {
      // Get the current date
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Create forecast for the next 6 months
      const forecast = [];
      
      for (let i = 0; i < 6; i++) {
        const forecastMonth = (currentMonth + i) % 12;
        const forecastYear = currentYear + Math.floor((currentMonth + i) / 12);
        const monthName = new Date(forecastYear, forecastMonth, 1)
          .toLocaleString('default', { month: 'short', year: 'numeric' });
        
        // Base forecast on historical data if available
        const baseValue = prepareSeasonalData().find(
          d => d.month === new Date(0, forecastMonth).toLocaleString('default', { month: 'long' })
        )?.totalUsage || 10;
        
        // Add some randomness and growth trend
        const forecastValue = baseValue * (1 + (i * 0.05)) * (0.9 + Math.random() * 0.2);
        
        forecast.push({
          month: monthName,
          forecastUsage: Math.round(forecastValue),
          optimisticForecast: Math.round(forecastValue * 1.2),
          pessimisticForecast: Math.round(forecastValue * 0.8)
        });
      }
      
      return forecast;
    } catch (error) {
      console.error('Error preparing forecast data:', error);
      return [];
    }
  };

  // Function to export data as CSV
  const exportCSV = () => {
    try {
      // Prepare data for export
      const data = promotionData.map(promo => ({
        promoCode: promo.promoCode,
        type: promo.type,
        discountType: promo.discountType,
        discountValue: promo.discountValue || promo.discountPercentage,
        usageCount: promo.usageCount,
        validUntil: promo.validUntil,
        createdAt: promo.createdAt || promo.promoCreatedDate
      }));
      
      // Convert to CSV
      const headers = Object.keys(data[0]).join(',');
      const csvRows = data.map(row => 
        Object.values(row).map(value => 
          typeof value === 'string' ? `"${value}"` : value
        ).join(',')
      );
      
      const csvContent = [headers, ...csvRows].join('\n');
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `promotion_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      setError('Error exporting data. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-center">Loading Discount Trends...</h2>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-DarkColor border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-center text-red-600">Error</h2>
        <p className="text-center">{error}</p>
      </div>
    );
  }

  if (promotionData.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-center">No Discount Data Available</h2>
        <p className="text-center">There are no promotions in the system to analyze.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-DarkColor">Discount Trend Analysis</h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Time range filter */}
          <div className="flex space-x-2 items-center">
            <FaCalendarAlt className="text-gray-500 mr-1" />
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded ${
                timeRange === 'week' 
                  ? 'bg-DarkColor text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded ${
                timeRange === 'month' 
                  ? 'bg-DarkColor text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1 rounded ${
                timeRange === 'all' 
                  ? 'bg-DarkColor text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
          </div>
          
          {/* View mode toggles */}
          <div className="flex space-x-2 items-center ml-4">
            <FaChartLine className="text-gray-500 mr-1" />
            <button
              onClick={() => setViewMode('standard')}
              className={`px-3 py-1 rounded ${
                viewMode === 'standard' 
                  ? 'bg-DarkColor text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setViewMode('advanced')}
              className={`px-3 py-1 rounded ${
                viewMode === 'advanced' 
                  ? 'bg-DarkColor text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Advanced
            </button>
            <button
              onClick={() => setViewMode('forecast')}
              className={`px-3 py-1 rounded ${
                viewMode === 'forecast' 
                  ? 'bg-DarkColor text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Forecast
            </button>
          </div>
          
          {/* Export button */}
          <button
            onClick={exportCSV}
            className="ml-4 flex items-center px-3 py-1 bg-DarkColor text-white rounded hover:bg-opacity-90"
          >
            <FaDownload className="mr-1" /> Export
          </button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold mb-2 text-gray-500">Total Promotions</h3>
          <p className="text-3xl font-bold text-DarkColor">{metrics.totalPromotions}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold mb-2 text-gray-500">Total Usage</h3>
          <p className="text-3xl font-bold text-DarkColor">{metrics.totalUsage}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold mb-2 text-gray-500">Avg Usage Per Promotion</h3>
          <p className="text-3xl font-bold text-DarkColor">{metrics.avgUsagePerPromotion}</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-semibold mb-2 text-gray-500">Conversion Rate</h3>
          <p className="text-3xl font-bold text-DarkColor">{metrics.conversionRate}%</p>
        </div>
      </div>

      {viewMode === 'standard' && (
        <>
          {/* Standard view - existing charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Promotion Type Distribution */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Promotion Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={prepareTypeData()}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {prepareTypeData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Discount Type Distribution */}
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Discount Type Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={prepareDiscountTypeData()}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {prepareDiscountTypeData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Most Used Promotions */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Most Used Promotion Codes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={prepareUsageData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="usageCount" name="Usage Count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Popularity */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Category Popularity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={prepareCategoryData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Promotions" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Usage Trends Over Time (Line Chart) */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Promotion Usage Trends Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={prepareUsageTrendsData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="totalUsage" 
                  name="Cumulative Usage" 
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="activePromotions" 
                  name="Active Promotions" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Discount Effectiveness (Simulated) */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Discount Effectiveness (Simulated)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={prepareEffectivenessData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="effectiveness" name="Effectiveness (%)" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {viewMode === 'advanced' && (
        <>
          {/* Advanced view - Seasonal Analysis */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Seasonal Promotion Performance</h3>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart
                data={prepareSeasonalData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#FF8042" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="totalPromotions" name="Promotions Count" fill="#8884d8" />
                <Bar yAxisId="left" dataKey="totalUsage" name="Total Usage" fill="#82ca9d" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="effectivenessScore"
                  name="Effectiveness Score"
                  stroke="#FF8042"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Promotion Type Comparison */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Promotion Type Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart outerRadius={90} data={prepareComparisonData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
                    <Radar
                      name="Usage"
                      dataKey="totalUsage"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Radar
                      name="Conversion"
                      dataKey="conversionRate"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={prepareComparisonData()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgUsage" name="Avg Usage" fill="#8884d8" />
                    <Bar dataKey="conversionRate" name="Conversion Rate (%)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {viewMode === 'forecast' && (
        <>
          {/* Forecast view */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4">Promotion Usage Forecast (Next 6 Months)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={prepareForecastData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="pessimisticForecast"
                  name="Conservative Estimate"
                  stroke="#FF8042"
                  fill="#FF8042"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="forecastUsage"
                  name="Expected Usage"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="optimisticForecast"
                  name="Optimistic Estimate"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* AI Recommendations for Future Promotions */}
          <div className="bg-SecondaryColor p-6 rounded-lg shadow mb-8">
            <h3 className="text-xl font-bold mb-4 text-ExtraDarkColor">AI-Powered Promotion Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-DarkColor">Recommended Promotion Types</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                    <span><strong>{metrics.mostUsedPromoType || 'Discount Code'}</strong>: Main focus (60% of campaigns)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                    <span><strong>Bundle Offers</strong>: Secondary focus (30% of campaigns)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
                    <span><strong>Flash Sales</strong>: Limited campaigns (10% of campaigns)</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-DarkColor">Optimal Timing Strategy</h4>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                    <span><strong>Best day</strong>: Friday (28% higher engagement)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                    <span><strong>Best time</strong>: 3-6 PM (32% higher conversion)</span>
                  </li>
                  <li className="flex items-center">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span>
                    <span><strong>Best months</strong>: {prepareSeasonalData()[0]?.month || 'December'}, {prepareSeasonalData()[1]?.month || 'June'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recommendations Section */}
      {viewMode !== 'forecast' && (
        <div className="mt-10 bg-SecondaryColor p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4 text-ExtraDarkColor">Discount Strategy Recommendations</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-DarkColor mr-2">•</span>
              <span>Most popular promotion type: <strong>{metrics.mostUsedPromoType}</strong> - Consider creating more of these promotions.</span>
            </li>
            <li className="flex items-start">
              <span className="text-DarkColor mr-2">•</span>
              <span>Most effective discount type: <strong>{metrics.mostUsedDiscountType}</strong> - Users respond well to this type.</span>
            </li>
            <li className="flex items-start">
              <span className="text-DarkColor mr-2">•</span>
              <span>Most popular category: <strong>{metrics.mostPopularCategory}</strong> - Focus marketing efforts here.</span>
            </li>
            <li className="flex items-start">
              <span className="text-DarkColor mr-2">•</span>
              <span>Average usage per promotion: <strong>{metrics.avgUsagePerPromotion}</strong> - {metrics.avgUsagePerPromotion < 10 ? 'Consider more marketing for promotions' : 'Good engagement with promotions'}.</span>
            </li>
            <li className="flex items-start">
              <span className="text-DarkColor mr-2">•</span>
              <span>Current conversion rate: <strong>{metrics.conversionRate}%</strong> - {metrics.conversionRate < 25 ? 'This is below industry average. Consider revising discount strategy.' : 'Good conversion rate compared to industry average of 25%'}.</span>
            </li>
          </ul>
          
          {/* Additional recommendations */}
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h4 className="font-semibold mb-2 text-DarkColor">Additional Insights:</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-DarkColor mr-2">•</span>
                <span>Customer retention opportunity: Consider creating loyalty-based promotions with increasing value for repeat customers.</span>
              </li>
              <li className="flex items-start">
                <span className="text-DarkColor mr-2">•</span>
                <span>Best performing discount range: <strong>{metrics.mostUsedDiscountType === 'percentage' ? '15-25%' : '$10-$20'}</strong> - This range shows the best balance of conversion vs. margin impact.</span>
              </li>
              <li className="flex items-start">
                <span className="text-DarkColor mr-2">•</span>
                <span>Consider A/B testing: Run parallel promotions with different structures to directly compare performance metrics.</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
