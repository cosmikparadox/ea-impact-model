import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

function App() {
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
    churn: false,
    cltv: false
  });

  const [inputs, setInputs] = React.useState({
    pipeline: 1000000,
    dealSize: 100000,
    winRate: 20,
    eaCost: 200000,
    salesCycle: 6,
    retention: 85,
    teamSize: 5,
    grossMargin: 70,
    expansion: 15,
    arr: 500000,
    nps: 30,
    churn: 15,
    cltv: 300000
  });

  const [results, setResults] = React.useState(null);
  const [activeView, setActiveView] = React.useState('summary');
  const [graphType, setGraphType] = React.useState('summary');
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  const uplifts = {
    pipeline: 0.20,
    teamSize: 0.15,
    winRate: 0.35,
    dealSize: 0.25,
    salesCycle: -0.30,
    retention: 0.15,
    grossMargin: 0.10,
    expansion: 0.25,
    arr: 0.20,
    nps: 0.30,
    churn: -0.25,
    cltv: 0.18
  };

  const metricConfig = {
    pipeline: { label: 'Annual Pipeline Value ($)', type: 'currency', color: '#3B82F6' },
    dealSize: { label: 'Average Deal Size ($)', type: 'currency', color: '#10B981' },
    winRate: { label: 'Current Win Rate (%)', type: 'percentage', color: '#F59E0B' },
    salesCycle: { label: 'Sales Cycle (months)', type: 'number', color: '#EF4444' },
    retention: { label: 'Customer Retention (%)', type: 'percentage', color: '#06B6D4' },
    teamSize: { label: 'Sales Team Size', type: 'number', color: '#8B5CF6' },
    grossMargin: { label: 'Gross Margin (%)', type: 'percentage', color: '#84CC16' },
    expansion: { label: 'Expansion Rate (%)', type: 'percentage', color: '#F97316' },
    arr: { label: 'Annual Recurring Revenue ($)', type: 'currency', color: '#EC4899' },
    nps: { label: 'Net Promoter Score', type: 'number', color: '#6366F1' },
    churn: { label: 'Churn Rate (%)', type: 'percentage', color: '#DC2626' },
    cltv: { label: 'Customer Lifetime Value ($)', type: 'currency', color: '#059669' },
    eaCost: { label: 'EA Annual Investment ($)', type: 'currency', color: '#64748B' }
  };

  function toggleMetric(metric) {
    setEnabledMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric]
    }));
  }

  function updateInput(field, value) {
    const numValue = Number(value) || 0;
    setInputs(prev => ({
      ...prev,
      [field]: numValue
    }));
  }

  function calculate() {
    try {
      const current = {};
      const projected = {};
      const improvements = {};
      let totalAnnualBenefit = 0;

      current.revenue = inputs.pipeline * (inputs.winRate / 100);
      current.pipeline = inputs.pipeline;
      current.teamSize = inputs.teamSize;
      current.winRate = inputs.winRate;
      current.dealSize = inputs.dealSize;
      current.salesCycle = inputs.salesCycle;
      current.retention = inputs.retention;
      current.grossMargin = inputs.grossMargin;
      current.expansion = inputs.expansion;
      current.arr = inputs.arr;
      current.nps = inputs.nps;
      current.churn = inputs.churn;
      current.cltv = inputs.cltv;

      let revenueGains = 0;

      if (enabledMetrics.pipeline) {
        projected.pipeline = inputs.pipeline * (1 + uplifts.pipeline);
        improvements.pipeline = projected.pipeline - current.pipeline;
      } else {
        projected.pipeline = current.pipeline;
        improvements.pipeline = 0;
      }

      if (enabledMetrics.teamSize) {
        projected.teamSize = Math.ceil(inputs.teamSize * (1 + uplifts.teamSize));
        improvements.teamSize = projected.teamSize - current.teamSize;
      } else {
        projected.teamSize = current.teamSize;
        improvements.teamSize = 0;
      }

      if (enabledMetrics.winRate) {
        projected.winRate = inputs.winRate * (1 + uplifts.winRate);
        const winRateRevenue = inputs.pipeline * (projected.winRate / 100);
        const winRateGain = winRateRevenue - current.revenue;
        revenueGains += winRateGain;
        improvements.winRate = projected.winRate - current.winRate;
      } else {
        projected.winRate = current.winRate;
        improvements.winRate = 0;
      }

      if (enabledMetrics.dealSize) {
        projected.dealSize = inputs.dealSize * (1 + uplifts.dealSize);
        const dealSizeGain = (inputs.pipeline / inputs.dealSize) * (projected.dealSize - inputs.dealSize) * (inputs.winRate / 100);
        revenueGains += dealSizeGain;
        improvements.dealSize = projected.dealSize - current.dealSize;
      } else {
        projected.dealSize = current.dealSize;
        improvements.dealSize = 0;
      }

      if (enabledMetrics.salesCycle) {
        projected.salesCycle = inputs.salesCycle * (1 + uplifts.salesCycle);
        const cycleGain = current.revenue * Math.abs(uplifts.salesCycle);
        revenueGains += cycleGain;
        improvements.salesCycle = current.salesCycle - projected.salesCycle;
      } else {
        projected.salesCycle = current.salesCycle;
        improvements.salesCycle = 0;
      }

      if (enabledMetrics.retention) {
        projected.retention = Math.min(95, inputs.retention * (1 + uplifts.retention));
        const retentionGain = current.revenue * (uplifts.retention * 0.8);
        totalAnnualBenefit += retentionGain;
        improvements.retention = projected.retention - current.retention;
      } else {
        projected.retention = current.retention;
        improvements.retention = 0;
      }

      if (enabledMetrics.grossMargin) {
        projected.grossMargin = Math.min(90, inputs.grossMargin * (1 + uplifts.grossMargin));
        const marginGain = (current.revenue + revenueGains) * (uplifts.grossMargin * (inputs.grossMargin / 100));
        totalAnnualBenefit += marginGain;
        improvements.grossMargin = projected.grossMargin - current.grossMargin;
      } else {
        projected.grossMargin = current.grossMargin;
        improvements.grossMargin = 0;
      }

      if (enabledMetrics.expansion) {
        projected.expansion = inputs.expansion * (1 + uplifts.expansion);
        const expansionGain = current.revenue * (uplifts.expansion * (inputs.expansion / 100));
        totalAnnualBenefit += expansionGain;
        improvements.expansion = projected.expansion - current.expansion;
      } else {
        projected.expansion = current.expansion;
        improvements.expansion = 0;
      }

      if (enabledMetrics.arr) {
        projected.arr = inputs.arr * (1 + uplifts.arr);
        const arrGain = projected.arr - current.arr;
        totalAnnualBenefit += arrGain * 0.3;
        improvements.arr = arrGain;
      } else {
        projected.arr = current.arr;
        improvements.arr = 0;
      }

      if (enabledMetrics.nps) {
        projected.nps = Math.min(80, inputs.nps * (1 + uplifts.nps));
        const npsGain = current.revenue * (uplifts.nps * 0.1);
        totalAnnualBenefit += npsGain;
        improvements.nps = projected.nps - current.nps;
      } else {
        projected.nps = current.nps;
        improvements.nps = 0;
      }

      if (enabledMetrics.churn) {
        projected.churn = Math.max(2, inputs.churn * (1 + uplifts.churn));
        const churnGain = current.revenue * (Math.abs(uplifts.churn) * (inputs.churn / 100));
        totalAnnualBenefit += churnGain;
        improvements.churn = current.churn - projected.churn;
      } else {
        projected.churn = current.churn;
        improvements.churn = 0;
      }

      if (enabledMetrics.cltv) {
        projected.cltv = inputs.cltv * (1 + uplifts.cltv);
        improvements.cltv = projected.cltv - current.cltv;
      } else {
        projected.cltv = current.cltv;
        improvements.cltv = 0;
      }

      projected.revenue = current.revenue + revenueGains;
      improvements.revenue = revenueGains;
      totalAnnualBenefit += revenueGains;

      projected.roi = inputs.eaCost > 0 ? ((totalAnnualBenefit - inputs.eaCost) / inputs.eaCost) * 100 : 0;
      projected.paybackMonths = totalAnnualBenefit > 0 ? (inputs.eaCost / totalAnnualBenefit) * 12 : 0;
      projected.netPresentValue = (totalAnnualBenefit * 3) - inputs.eaCost;

      const calculatedResults = {
        current,
        projected,
        improvements,
        totalAnnualBenefit
      };
      
      setResults(calculatedResults);
      
    } catch (error) {
      alert('Error in calculation. Please check your inputs.');
    }
  }

  function formatCurrency(value) {
    const num = Number(value) || 0;
    return '$' + num.toLocaleString();
  }

  function formatNumber(value, decimals = 1) {
    const num = Number(value) || 0;
    return num.toFixed(decimals);
  }

  function formatPercentage(value) {
    const num = Number(value) || 0;
    return num.toFixed(1) + '%';
  }

  function formatValue(value, type) {
    if (value === null || value === undefined) return 'N/A';
    
    switch (type) {
      case 'currency':
        return formatCurrency(value);
      case 'percentage':
        return formatPercentage(value);
      default:
        return formatNumber(value);
    }
  }

  const getEnabledMetricsData = () => {
    if (!results) return [];
    
    const data = [];
    
    Object.keys(enabledMetrics).forEach(key => {
      if (enabledMetrics[key] && results.current[key] !== undefined && results.projected[key] !== undefined && key !== 'eaCost') {
        const current = results.current[key];
        const projected = results.projected[key];
        
        if (current !== null && projected !== null && !isNaN(current) && !isNaN(projected) && current > 0) {
          const improvementPercent = ((projected - current) / current) * 100;
          
          data.push({
            metric: metricConfig[key]?.label || key,
            improvement: improvementPercent,
            color: metricConfig[key]?.color || '#3B82F6'
          });
        }
      }
    });
    
    if (results.current.revenue && results.projected.revenue && results.current.revenue > 0) {
      const revenueImprovement = ((results.projected.revenue - results.current.revenue) / results.current.revenue) * 100;
      data.push({
        metric: 'Revenue',
        improvement: revenueImprovement,
        color: '#3B82F6'
      });
    }
    
    return data;
  };

  const getRevenueComparisonData = () => {
    if (!results) return [];
    return [
      { name: 'Current', value: results.current.revenue },
      { name: 'With EA', value: results.projected.revenue }
    ];
  };

  const getROIProjectionData = () => {
    if (!results) return [];
    const annualBenefit = results.totalAnnualBenefit;
    return [
      { year: 'Year 1', benefit: annualBenefit, cumulative: annualBenefit - inputs.eaCost },
      { year: 'Year 2', benefit: annualBenefit * 1.1, cumulative: (annualBenefit * 2.1) - inputs.eaCost },
      { year: 'Year 3', benefit: annualBenefit * 1.2, cumulative: (annualBenefit * 3.3) - inputs.eaCost }
    ];
  };

  const getEnabledMetricsCount = () => {
    return Object.values(enabledMetrics).filter(Boolean).length;
  };

  const getGraphTypeLabel = () => {
    switch (graphType) {
      case 'summary': return 'Revenue';
      case 'multi': return 'Multi-Metric';
      case 'detailed': return 'Individual';
      default: return 'Unknown';
    }
  };

  const getViewLabel = () => {
    switch (activeView) {
      case 'summary': return 'Summary';
      case 'detailed': return 'Detailed';
      case 'roi': return '3-Year ROI';
      default: return 'Unknown';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className={`${sidebarCollapsed ? 'w-28' : 'w-80'} bg-white shadow-lg transition-all duration-300 ease-in-out`}>
        <div className="p-4 overflow-y-auto h-full">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && <h2 className="text-xl font-bold text-green-700">EA ROI Calculator</h2>}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded hover:bg-gray-100"
            >
              {sidebarCollapsed ? '→' : '←'}
            </button>
          </div>
          
          {sidebarCollapsed ? (
            <div className="space-y-4 text-center">
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-xs text-gray-600">Metrics</div>
                <div className="text-lg font-bold text-blue-600">{getEnabledMetricsCount()}</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="text-xs text-gray-600">View</div>
                <div className="text-sm font-semibold text-green-600">{getViewLabel()}</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="text-xs text-gray-600">Graph</div>
                <div className="text-sm font-semibold text-purple-600">{getGraphTypeLabel()}</div>
              </div>
              {results && (
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="text-xs text-gray-600">ROI</div>
                  <div className="text-sm font-bold text-yellow-600">{formatPercentage(results.projected.roi)}</div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-gray-700">Enable Metrics:</h3>
                {Object.entries(metricConfig).filter(([key]) => key !== 'eaCost').map(([key, config]) => (
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
                <h3 className="font-semibold mb-3 text-gray-700">View:</h3>
                <select 
                  value={activeView} 
                  onChange={(e) => setActiveView(e.target.value)}
                  className="w-full border p-2 rounded mb-3"
                >
                  <option value="summary">Executive Summary</option>
                  <option value="detailed">Impact Breakdown</option>
                  <option value="roi">3-Year Projection</option>
                </select>
              </div>

              <div className="mb-4">
                <h3 className="font-semibold mb-3 text-gray-700">Graph Type:</h3>
                <select 
                  value={graphType} 
                  onChange={(e) => setGraphType(e.target.value)}
                  className="w-full border p-2 rounded"
                >
                  <option value="summary">Revenue Comparison</option>
                  <option value="multi">Multi-Metric View</option>
                  <option value="detailed">Individual Charts</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-sm border-b mb-6 p-4 rounded-lg">
            <h1 className="text-3xl font-bold text-gray-900">Enterprise Architect ROI Calculator</h1>
            <p className="text-gray-600 mt-1">Configure metrics and demonstrate EA financial impact</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(metricConfig).map(([key, config]) => 
                (enabledMetrics[key] || key === 'eaCost') && (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{config.label}</label>
                    <input
                      type="number"
                      value={inputs[key]}
                      onChange={(e) => updateInput(key, e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                )
              )}
            </div>
            
            <button 
              onClick={calculate}
              className="mt-6 bg-green-600 text-white px-8 py-3 rounded-md text-lg font-medium hover:bg-green-700"
            >
              Calculate EA Impact
            </button>
          </div>

          {results && (
            <div className="space-y-6">
              {activeView === 'summary' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-700">Compelling EA Business Case</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                        <span className="text-gray-700 font-medium">Additional Annual Revenue:</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.improvements.revenue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                        <span className="text-gray-700 font-medium">Total Annual Benefit:</span>
                        <span className="text-xl font-semibold text-blue-700">
                          {formatCurrency(results.totalAnnualBenefit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                        <span className="text-gray-700 font-medium">Return on Investment:</span>
                        <span className={`text-xl font-bold ${results.projected.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(results.projected.roi)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                        <span className="text-gray-700 font-medium">Payback Period:</span>
                        <span className="text-lg font-medium text-purple-600">
                          {formatNumber(results.projected.paybackMonths)} months
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">
                      {graphType === 'summary' && 'Revenue Impact'}
                      {graphType === 'multi' && 'Percentage Improvement by Metric'}
                      {graphType === 'detailed' && 'Individual Charts'}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      {graphType === 'summary' && (
                        <BarChart data={getRevenueComparisonData()}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Bar dataKey="value" fill="#10B981" />
                        </BarChart>
                      )}
                      {graphType === 'multi' && (
                        <BarChart data={getEnabledMetricsData()}>
                          <XAxis dataKey="metric" angle={-45} textAnchor="end" height={100} />
                          <YAxis label={{ value: 'Improvement (%)', angle: -90, position: 'insideLeft' }} />
                          <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                          <Bar dataKey="improvement" fill="#10B981" />
                        </BarChart>
                      )}
                      {graphType === 'detailed' && (
                        <div className="space-y-4">
                          {Object.keys(enabledMetrics).filter(key => enabledMetrics[key] && results?.current[key] !== undefined).map(key => (
                            <div key={key} className="bg-white rounded-lg shadow p-4">
                              <h4 className="font-semibold mb-2">{metricConfig[key]?.label}</h4>
                              <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={[
                                  { name: 'Current', value: results.current[key] },
                                  { name: 'With EA', value: results.projected[key] }
                                ]}>
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar dataKey="value" fill={metricConfig[key]?.color || '#3B82F6'} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ))}
                        </div>
                      )}
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {activeView === 'detailed' && (
                <div className="space-y-6">
                  {Object.keys(enabledMetrics).filter(key => enabledMetrics[key]).map(key => (
                    <div key={key} className="bg-white rounded-lg shadow p-6">
                      <h4 className="font-semibold mb-4">{metricConfig[key]?.label} Impact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p><strong>Current:</strong> {formatValue(results.current[key], metricConfig[key]?.type)}</p>
                          <p><strong>Projected:</strong> {formatValue(results.projected[key], metricConfig[key]?.type)}</p>
                          <p><strong>Improvement:</strong> {formatValue(results.improvements[key], metricConfig[key]?.type)}</p>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={[
                            { name: 'Current', value: results.current[key] },
                            { name: 'With EA', value: results.projected[key] }
                          ]}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill={metricConfig[key]?.color || '#3B82F6'} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeView === 'roi' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">3-Year ROI Projection</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={getROIProjectionData()}>
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="benefit" stroke="#10B981" strokeWidth={3} name="Annual Benefit" />
                      <Line type="monotone" dataKey="cumulative" stroke="#3B82F6" strokeWidth={3} name="Cumulative Value" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;