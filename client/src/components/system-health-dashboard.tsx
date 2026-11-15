import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Server, 
  Wifi,
  XCircle,
  Zap
} from 'lucide-react';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  errorCount: number;
  successRate: number;
}

interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'down';
  services: HealthMetric[];
  uptime: number;
  timestamp: Date;
}

const SystemHealthDashboard: React.FC = () => {
  const [isMinimized, setIsMinimized] = useState(true);

  const { data: healthData, isLoading, refetch } = useQuery<SystemHealth>({
    queryKey: ['/api/health'],
    refetchInterval: 30000, // Update every 30 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'down':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'border-green-500/50 text-green-400 bg-green-500/10';
      case 'degraded':
        return 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10';
      case 'down':
        return 'border-red-500/50 text-red-400 bg-red-500/10';
      default:
        return 'border-gray-500/50 text-gray-400 bg-gray-500/10';
    }
  };

  const formatServiceName = (name: string) => {
    return name.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatUptime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  if (!healthData && !isLoading) return null;

  // Minimized view - floating indicator
  if (isMinimized) {
    const overallStatus = healthData?.overall || 'healthy';
    const statusIcon = getStatusIcon(overallStatus);
    
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={() => setIsMinimized(false)}
          variant="outline"
          size="sm"
          className={`${getStatusColor(overallStatus)} border-2 hover:bg-opacity-20 transition-all duration-300 animate-pulse`}
        >
          {statusIcon}
          <span className="ml-2 font-medium">System Health</span>
          {healthData && (
            <span className="ml-2 text-xs opacity-80">
              {healthData.services.filter(s => s.status === 'healthy').length}/{healthData.services.length}
            </span>
          )}
        </Button>
      </div>
    );
  }

  // Expanded dashboard view
  return (
    <div className="fixed bottom-4 right-4 z-40 w-96 max-h-[80vh] overflow-y-auto">
      <Card className="bg-gray-900/95 border-gray-700 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-400" />
              <CardTitle className="text-lg text-white">System Health</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="border-gray-600 hover:bg-gray-800"
                disabled={isLoading}
              >
                <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={() => setIsMinimized(true)}
                variant="outline"
                size="sm"
                className="border-gray-600 hover:bg-gray-800"
              >
                ×
              </Button>
            </div>
          </div>
          {healthData && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthData.overall)}
                <Badge variant="outline" className={getStatusColor(healthData.overall)}>
                  {healthData.overall.toUpperCase()}
                </Badge>
              </div>
              <div className="text-sm text-gray-400">
                Uptime: {formatUptime(healthData.uptime)}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-12 bg-gray-800/50 rounded animate-pulse" />
              ))}
            </div>
          ) : healthData ? (
            healthData.services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="font-medium text-white text-sm">
                      {formatServiceName(service.name)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {service.responseTime > 0 ? `${Math.round(service.responseTime)}ms` : 'No data'}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {Math.round(service.successRate)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {service.errorCount > 0 ? `${service.errorCount} errors` : 'No errors'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400 py-4">
              Unable to load health data
            </div>
          )}

          {healthData && (
            <div className="mt-4 pt-3 border-t border-gray-700">
              <div className="text-xs text-gray-400 mb-2">Service Availability</div>
              <Progress 
                value={(healthData.services.filter(s => s.status === 'healthy').length / healthData.services.length) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>
                  {healthData.services.filter(s => s.status === 'healthy').length} / {healthData.services.length} healthy
                </span>
                <span className="text-xs text-gray-500">
                  Last updated: {new Date(healthData.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthDashboard;