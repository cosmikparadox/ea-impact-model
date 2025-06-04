# Create the corrected App.js file
app_js_content = '''import React from 'react';
import {
  BarChart, LineChart, XAxis, YAxis, Bar, Line, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

function App() {
  // State for metric toggles
  const [enabledMetrics, setEnabledMetrics] = React.useState({
    pipeline: true,
    dealSize: true,
    winRate: true,
    salesCycle: false,
    retention: false,
    grossMargin: false,
    expansion: false,
    arr: false,
    nps: false,
    eaCost: false,
    churn: false,
    cltv: false
  });

  // State for input values
  const [inputs, setInputs] = React.useState({
    pipeline: 1000000,
    dealSize: 100000,
    winRate: 20,
    salesReps: 5,
    salesCycle: 6,
    retention: 85,
    grossMargin: 70,
    expansion: 15,
    arr: 500000,
    nps: 30,
    eaCost: 200000,
    churn: 15,
    cltv: 300000
  });

  const [results, setResults] = React.useState(null);
  const [activeView, setActiveView] = React.useState('summary');
  const [graphType, setGraphType] = React.useState('summary');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Industry-standard uplifts
  const uplifts = {
    winRate: 0.20,
    dealSize: 0.10,
    salesCycle: -0.15,
    retention: 0.12,
    expansion: 0.25,
    nps: 0.30,
    churn: -0.20
  };

  const metricConfig = {
    pipeline: { label: 'Pipeline ($)', type: 'currency', color: '#3B82F6' },
    dealSize: { label: 'Average Deal Size ($)', type: 'currency', color: '#10B981' },
    winRate: { label: 'Current Win Rate (%)', type: 'percentage', color: '#F59E0B' },
    salesReps: { label: 'Number of Sales Reps', type: 'number', color: '#8B5CF6' },
    salesCycle: { label: 'Average Sales Cycle (months)', type: 'number', color: '#EF4444' },
    retention: { label: 'Customer Retention Rate (%)', type: 'percentage', color: '#06B6D4' },
    grossMargin: { label: 'Gross Margin (%)', type: 'percentage', color: '#84CC16' },
    expansion: { label: 'Expansion/Upsell Rate (%)', type: 'percentage', color: '#F97316' },
    arr: { label: 'Annual Recurring Revenue ($)', type: 'currency', color: '#EC4899' },
    nps: { label: 'Net Promoter Score', type: 'number', color: '#6366F1' },
    eaCost: { label: 'Cost of EA Investment ($)', type: 'currency', color: '#64748B' },
    churn: { label: 'Churn Rate (%)', type: 'percentage', color: '#DC2626' },
    cltv: { label: 'Customer Lifetime Value ($)', type: 'currency', color: '#059669' },
    revenue: { label: 'Revenue ($)', type: 'currency', color: '#3B82F6' },
    grossProfit: { label: 'Gross Profit ($)', type: 'currency', color: '#84CC16' }
  };

  function toggleMetric(metric) {
    setEnabledMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  }

  function updateInput(metric, value) {
    setInputs(prev => ({
      ...prev,
      [metric]: Number(value)
    }));
  }

  function calculate() {
    const current = {};
    const projected = {};
    const improvements = {};

    // Basic calculations
    if (enabledMetrics.pipeline && enabledMetrics.winRate && enabledMetrics.dealSize) {
      current.wins = (inputs.pipeline * (inputs.winRate / 100)) / inputs.dealSize;
      current.revenue = inputs.pipeline * (inputs.winRate / 100);
      
      projected.winRate = inputs.winRate * (1 + uplifts.winRate);
      projected.dealSize = inputs.dealSize * (1 + uplifts.dealSize);
      projected.wins = (inputs.pipeline * (projected.winRate / 100)) / projected.dealSize;
      projected.revenue = inputs.pipeline * (projected.winRate / 100);
      
      improvements.revenue = projected.revenue - current.revenue;
    }

    // Individual metric calculations
    if (enabledMetrics.winRate) {
      current.winRate = inputs.winRate;
      projected.winRate = inputs.winRate * (1 + uplifts.winRate);
      improvements.winRate = projected.winRate - current.winRate;
    }

    if (enabledMetrics.dealSize) {
      current.dealSize = inputs.dealSize;
      projected.dealSize = inputs.dealSize * (1 + uplifts.dealSize);
      improvements.dealSize = projected.dealSize - current.dealSize;
    }

    if (enabledMetrics.pipeline) {
      current.pipeline = inputs.pipeline;
      projected.pipeline = inputs.pipeline; // Pipeline stays same, but conversion improves
      improvements.pipeline = 0;
    }

    // Sales cycle improvements
    if (enabledMetrics.salesCycle) {
      current.salesCycle = inputs.salesCycle;
      projected.salesCycle = inputs.salesCycle * (1 + uplifts.salesCycle);
      improvements.salesCycle = current.salesCycle - projected.salesCycle;
    }

    // Retention improvements
    if (enabledMetrics.retention) {
      current.retention = inputs.retention;
      projected.retention = Math.min(95, inputs.retention * (1 + uplifts.retention));
      improvements.retention = projected.retention - current.retention;
    }

    // Gross margin calculations
    if (enabledMetrics.grossMargin && current.revenue) {
      current.grossProfit = current.revenue * (inputs.grossMargin / 100);
      projected.grossProfit = projected.revenue * (inputs.grossMargin / 100);
      improvements.grossProfit = projected.grossProfit - current.grossProfit;
    }

    // Expansion rate improvements
    if (enabledMetrics.expansion) {
      current.expansion = inputs.expansion;
      projected.expansion = inputs.expansion * (1 + uplifts.expansion);
      improvements.expansion = projected.expansion - current.expansion;
    }

    // ARR improvements
    if (enabledMetrics.arr) {
      current.arr = inputs.arr;
      const arrMultiplier = 1 + (enabledMetrics.winRate ? uplifts.winRate * 0.5 : 0) + (enabledMetrics.expansion ? uplifts.expansion * 0.3 : 0);
      projected.arr = inputs.arr * arrMultiplier;
      improvements.arr = projected.arr - current.arr;
    }

    // NPS improvements
    if (enabledMetrics.nps) {
      current.nps = inputs.nps;
      projected.nps = Math.min(80, inputs.nps * (1 + uplifts.nps));
      improvements.nps = projected.nps - current.nps;
    }

    // Churn improvements
    if (enabledMetrics.churn) {
      current.churn = inputs.churn;
      projected.churn = Math.max(2, inputs.churn * (1 + uplifts.churn));
      improvements.churn = current.churn - projected.churn;
    }

    // CLTV improvements
    if (enabledMetrics.cltv) {
      current.cltv = inputs.cltv;
      const cltvMultiplier = 1 + (enabledMetrics.retention ? uplifts.retention * 0.8 : 0);
      projected.cltv = inputs.cltv * cltvMultiplier;
      improvements.cltv = projected.cltv - current.cltv;
    }

    // Sales reps (no change, just for display)
    if (enabledMetrics.salesReps) {
      current.salesReps = inputs.salesReps;
      projected.salesReps = inputs.salesReps;
      improvements.salesReps = 0;
    }

    // EA Cost (investment, no improvement)
    if (enabledMetrics.eaCost) {
      current.eaCost = inputs.eaCost;
      projected.eaCost = inputs.eaCost;
      improvements.eaCost = 0;
    }

    // ROI and Payback
    if (enabledMetrics.eaCost && improvements.revenue) {
      const annualBenefit = improvements.revenue;
      projected.roi = ((annualBenefit - inputs.eaCost) / inputs.eaCost) * 100;
      projected.paybackMonths = inputs.eaCost > 0 ? (inputs.eaCost / annualBenefit) * 12 : 0;
    }

    console.log('Calculation results:', { current, projected, improvements });
    setResults({ current, projected, improvements });
  }

  function formatValue(value, type) {
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
      case 'currency':
        return `$${Number(value).toLocaleString()}`;
      case 'percentage':
        return `${Number(value).toFixed(1)}%`;
      default:
        return Number(value).toFixed(1);
    }
  }

  // Get enabled metrics for charts - showing percentage improvements
  const getEnabledMetricsData = () => {
    if (!results) return [];
    
    const data = [];
    
    Object.keys(enabledMetrics).forEach(key => {
      if (enabledMetrics[key] && results.current[key] !== undefined && results.projected[key] !== undefined) {
        const current = results.current[key];
        const projected = results.projected[key];
        const improvementPercent = current !== 0 ? ((projected - current) / Math.abs(current)) * 100 : 0;
        
        data.push({
          metric: metricConfig[key]?.label || key,
          current: current,
          projected: projected,
          improvement: improvementPercent,
          color: metricConfig[key]?.color || '#3B82F6'
        });
      }
    });
    
    // Add revenue if pipeline metrics are enabled
    if (enabledMetrics.pipeline && enabledMetrics.winRate && enabledMetrics.dealSize && results.current.revenue) {
      const current = results.current.revenue;
      const projected = results.projected.revenue;
      const improvementPercent = current !== 0 ? ((projected - current) / current) * 100 : 0;
      
      data.push({
        metric: 'Revenue ($)',
        current: current,
        projected: projected,
        improvement: improvementPercent,
        color: '#3B82F6'
      });
    }
    
    // Add gross profit if available
    if (enabledMetrics.grossMargin && results.current.grossProfit) {
      const current = results.current.grossProfit;
      const projected = results.projected.grossProfit;
      const improvementPercent = current !== 0 ? ((projected - current) / current) * 100 : 0;
      
      data.push({
        metric: 'Gross Profit ($)',
        current: current,
        projected: projected,
        improvement: improvementPercent,
        color: '#84CC16'
      });
    }
    
    console.log('Multi-metric data:', data);
    return data;
  };

  // Chart data for single metric view
  const getSingleMetricData = (metric) => {
    if (!results) return [];
    
    const current = results.current[metric];
    const projected = results.projected[metric];
    
    if (current === undefined || projected === undefined) return [];
    
    return [
      { name: 'Current', value: current },
      { name: 'With EA', value: projected }
    ];
  };

  // Get primary metric for simple summary
  const getPrimaryMetric = () => {
    if (enabledMetrics.pipeline && enabledMetrics.winRate && enabledMetrics.dealSize && results?.current.revenue) return 'revenue';
    if (enabledMetrics.salesCycle && results?.current.salesCycle) return 'salesCycle';
    if (enabledMetrics.retention && results?.current.retention) return 'retention';
    if (enabledMetrics.arr && results?.current.arr) return 'arr';
    if (enabledMetrics.nps && results?.current.nps) return 'nps';
    if (enabledMetrics.winRate && results?.current.winRate) return 'winRate';
    if (enabledMetrics.dealSize && results?.current.dealSize) return 'dealSize';
    return null;
  };

  // Get all available metrics for detailed view
  const getAvailableMetrics = () => {
    if (!results) return [];
    
    const metrics = [];
    
    Object.keys(enabledMetrics).forEach(key => {
      if (enabledMetrics[key] && results.current[key] !== undefined) {
        metrics.push(key);
      }
    });
    
    // Add revenue if available
    if (enabledMetrics.pipeline && enabledMetrics.winRate && enabledMetrics.dealSize && results.current.revenue) {
      metrics.push('revenue');
    }
    
    // Add gross profit if available
    if (enabledMetrics.grossMargin && results.current.grossProfit) {
      metrics.push('grossProfit');
    }
    
    return metrics;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-28' : 'w-80'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="p-4 overflow-y-auto h-full">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && <h2 className="text-xl font-bold">EA Impact Calculator</h2>}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded flex-shrink-0"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              )}
            </button>
          </div>
          
          {!sidebarCollapsed && (
            <>
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Enable Metrics:</h3>
                {Object.entries(metricConfig).filter(([key]) => key !== 'revenue' && key !== 'grossProfit').map(([key, config]) => (
                  <label key={key} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={enabledMetrics[key]}
                      onChange={() => toggleMetric(key)}
                      className="mr-2"
                    />
                    <span className="text-sm">{config.label}</span>
                  </label>
                ))}
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-3">View:</h3>
                <select 
                  value={activeView} 
                  onChange={(e) => setActiveView(e.target.value)}
                  className="w-full border p-2 rounded mb-3"
                >
                  <option value="summary">Summary</option>
                  <option value="detailed">Detailed Charts</option>
                  <option value="roi">ROI Analysis</option>
                </select>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-3">Graph Type:</h3>
                <select 
                  value={graphType} 
                  onChange={(e) => setGraphType(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="summary">Simple Summary</option>
                  <option value="multi">Multi-Metric</option>
                  <option value="detailed">Individual Charts</option>
                </select>
              </div>
            </>
          )}
          
          {sidebarCollapsed && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Metrics</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(enabledMetrics).filter(Boolean).length}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">View</div>
                <div className="text-sm font-medium capitalize text-center break-words">
                  {activeView}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Graph</div>
                <div className="text-sm font-medium capitalize text-center break-words">
                  {graphType}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Enterprise Architect Financial Impact Model</h1>
          
          {/* Inputs */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Input Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(metricConfig).filter(([key]) => key !== 'revenue' && key !== 'grossProfit').map(([key, config]) => 
                enabledMetrics[key] && (
                  <div key={key}>
                    <label className="block text-sm font-medium mb-1">{config.label}</label>
                    <input
                      type="number"
                      value={inputs[key]}
                      onChange={(e) => updateInput(key, e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                )
              )}
            </div>
            <button 
              onClick={calculate}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Calculate Impact
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="space-y-6">
              {activeView === 'summary' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Summary Results</h3>
                  
                  {/* Key Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {enabledMetrics.pipeline && results.current.revenue && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {formatValue(results.improvements.revenue, 'currency')}
                        </div>
                        <div className="text-sm text-gray-600">Additional Revenue</div>
                      </div>
                    )}
                    {enabledMetrics.salesCycle && results.improvements.salesCycle && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatValue(results.improvements.salesCycle, 'number')} mo
                        </div>
                        <div className="text-sm text-gray-600">Cycle Reduction</div>
                      </div>
                    )}
                    {enabledMetrics.eaCost && results.projected.roi && (
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {formatValue(results.projected.roi, 'percentage')}
                        </div>
                        <div className="text-sm text-gray-600">ROI</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Dynamic Charts Based on Graph Type */}
                  {graphType === 'summary' && getPrimaryMetric() && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">
                        {metricConfig[getPrimaryMetric()]?.label || 'Primary Metric'} Impact
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={getSingleMetricData(getPrimaryMetric())}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Bar dataKey="value" fill="#3B82F6" />
                          <Tooltip />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {graphType === 'multi' && getEnabledMetricsData().length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Multi-Metric Improvement Comparison (% Change)</h4>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={getEnabledMetricsData()}>
                          <XAxis dataKey="metric" angle={-45} textAnchor="end" height={100} />
                          <YAxis label={{ value: 'Improvement %', angle: -90, position: 'insideLeft' }} />
                          <Bar dataKey="improvement" fill="#10B981" name="% Improvement" />
                          <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, 'Improvement']} />
                          <Legend />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {graphType === 'detailed' && (
                    <div className="mt-6 space-y-6">
                      {getAvailableMetrics().map(key => (
                        <div key={key} className="border-t pt-4">
                          <h4 className="font-semibold mb-2">{metricConfig[key]?.label || key} Impact</h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={getSingleMetricData(key)}>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Bar dataKey="value" fill={metricConfig[key]?.color || '#3B82F6'} />
                              <Tooltip />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeView === 'detailed' && (
                <div className="space-y-6">
                  {getAvailableMetrics().map(key => (
                    <div key={key} className="bg-white rounded-lg shadow p-6">
                      <h4 className="font-semibold mb-2">{metricConfig[key]?.label || key} Impact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p>Current: {formatValue(results.current[key], metricConfig[key]?.type || 'number')}</p>
                          <p>Projected: {formatValue(results.projected[key], metricConfig[key]?.type || 'number')}</p>
                          <p>Improvement: {formatValue(results.improvements[key], metricConfig[key]?.type || 'number')}</p>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={getSingleMetricData(key)}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Bar dataKey="value" fill={metricConfig[key]?.color || '#3B82F6'} />
                            <Tooltip />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeView === 'roi' && enabledMetrics.eaCost && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">ROI Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Financial Metrics</h4>
                      <ul className="space-y-2">
                        <li>Investment: {formatValue(inputs.eaCost, 'currency')}</li>
                        <li>Annual Benefit: {formatValue(results.improvements.revenue, 'currency')}</li>
                        <li>ROI: {formatValue(results.projected.roi, 'percentage')}</li>
                        <li>Payback: {formatValue(results.projected.paybackMonths, 'number')} months</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">3-Year Projection</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={[
                          { year: 'Year 1', value: results.improvements.revenue || 0 },
                          { year: 'Year 2', value: (results.improvements.revenue || 0) * 1.1 },
                          { year: 'Year 3', value: (results.improvements.revenue || 0) * 1.2 }
                        ]}>
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                          <Tooltip />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;'''

# Write the corrected App.js file
with open('App_fixed.js', 'w') as f:
    f.write(app_js_content)

print("Fixed App.js file created successfully!")
print("\nKey fixes made:")
print("1. Removed the incorrect 'window.Recharts' reference")
print("2. Added ResponsiveContainer import from recharts")
print("3. Wrapped all charts in ResponsiveContainer for better responsiveness")
print("4. Fixed the conditional rendering logic")
print("5. Updated default input values to match your screenshot")