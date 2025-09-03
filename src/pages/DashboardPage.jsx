import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BarChart3, Clock, LineChart, MessageSquare, PieChart, Users, XCircle } from 'lucide-react';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { DonutChart, BarChart, AreaChart } from '@/components/ui/tremor';
import { formatChartDate } from '@/lib/date';

const valueFormatter = (number) => `${new Intl.NumberFormat('pt-BR').format(number).toString()}`;

const StatCard = ({ title, value, icon: Icon, isLoading, description }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <>
                    <Skeleton className="h-8 w-24 mt-1" />
                    <Skeleton className="h-4 w-32 mt-2" />
                </>
            ) : (
                <>
                    <div className="text-2xl font-bold">{value}</div>
                    {description && <p className="text-xs text-muted-foreground">{description}</p>}
                </>
            )}
        </CardContent>
    </Card>
);

const ChartCard = ({ title, description, icon: Icon, isLoading, isError, children }) => (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-2">
                {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
                <CardTitle>{title}</CardTitle>
            </div>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex items-center justify-center h-60">
                    <Skeleton className="h-full w-full" />
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center h-60 text-destructive">
                    <XCircle className="h-8 w-8 mb-2" />
                    <p>Erro ao carregar dados do gráfico.</p>
                </div>
            ) : (
                children
            )}
        </CardContent>
    </Card>
);

const DashboardPage = () => {
    const { metrics, isLoading, isError } = useDashboardMetrics();

    const formatTime = (timeString) => {
        if (!timeString || typeof timeString !== 'string') return 'N/A';
        const parts = timeString.split(':');
        const h = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const s = Math.floor(parseFloat(parts[2])).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const monthlyChartData = metrics?.comparativo_mensal?.map(item => ({
        ...item,
        mes: formatChartDate(item.mes),
    })) || [];

    const hourlyChartData = metrics?.jsonb_agg?.map(item => ({
        ...item,
        hora: `${String(item.hora).padStart(2, '0')}:00`,
    })).sort((a, b) => a.hora.localeCompare(b.hora)) || [];


    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 p-6 overflow-y-auto"
        >
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>

            {isError && (
                 <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-lg flex items-center gap-3 mb-6">
                    <AlertCircle className="h-5 w-5" />
                    <p>Não foi possível carregar os indicadores do dashboard. Tente atualizar a página.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard 
                    title="Total de Conversas" 
                    value={isLoading ? '' : metrics?.total_conversas ?? 'N/A'}
                    icon={MessageSquare} 
                    isLoading={isLoading}
                />
                <StatCard 
                    title="Média de Mensagens" 
                    value={isLoading ? '' : Number(metrics?.media_msgs_por_conversa ?? 0).toFixed(2)}
                    description="Por conversa"
                    icon={BarChart3} 
                    isLoading={isLoading}
                />
                <StatCard 
                    title="Tempo Médio de 1ª Resposta" 
                    value={isLoading ? '' : formatTime(metrics?.tempo_medio_primeira_resposta)}
                    icon={Clock} 
                    isLoading={isLoading}
                />
                <StatCard 
                    title="Taxa de Abandono" 
                    value={isLoading ? '' : `${Number(metrics?.abandono?.taxa_abandono ?? 0).toFixed(2)}%`}
                    icon={XCircle} 
                    isLoading={isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ChartCard 
                    title="Atendimentos por Operador"
                    description="Total de conversas atribuídas a cada operador."
                    icon={Users}
                    isLoading={isLoading}
                    isError={isError}
                >
                    <BarChart
                        data={metrics?.atendimentos_por_operador || []}
                        index="nome"
                        categories={['conversas']}
                        colors={['blue']}
                        valueFormatter={valueFormatter}
                        yAxisWidth={48}
                        className="h-60"
                    />
                </ChartCard>
                <ChartCard 
                    title="Distribuição por Tipo de Usuário"
                    description="Distribuição de mensagens por tipo de remetente."
                    icon={PieChart}
                    isLoading={isLoading}
                    isError={isError}
                >
                    <DonutChart
                        data={metrics?.distribuicao_por_tipo_usuario || []}
                        category="total"
                        index="tipo"
                        colors={['cyan', 'violet', 'fuchsia']}
                        valueFormatter={valueFormatter}
                        className="h-60"
                    />
                </ChartCard>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <ChartCard 
                    title="Comparativo Mensal de Conversas"
                    description="Evolução do número de conversas ao longo dos meses."
                    icon={LineChart}
                    isLoading={isLoading}
                    isError={isError}
                >
                    <AreaChart
                        data={monthlyChartData}
                        index="mes"
                        categories={['conversas_mes']}
                        colors={['indigo']}
                        valueFormatter={valueFormatter}
                        yAxisWidth={48}
                        className="h-60"
                        showLegend={false}
                    />
                </ChartCard>
                 <ChartCard 
                    title="Evolução Horária de Mensagens"
                    description="Volume de mensagens recebidas por hora do dia."
                    icon={LineChart}
                    isLoading={isLoading}
                    isError={isError}
                >
                    <AreaChart
                        data={hourlyChartData}
                        index="hora"
                        categories={['mensagens']}
                        colors={['rose']}
                        valueFormatter={valueFormatter}
                        yAxisWidth={48}
                        className="h-60"
                        showLegend={false}
                    />
                </ChartCard>
            </div>
        </motion.div>
    );
};

export default DashboardPage;