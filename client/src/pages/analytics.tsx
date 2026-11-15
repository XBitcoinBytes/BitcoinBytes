import { LazyAdvancedAnalyticsWrapper, LazyMarketSimulatorWrapper } from "@/components/lazy-components";
import ProgressiveLoader from "@/components/progressive-loader";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <LazyAdvancedAnalyticsWrapper />
      
      {/* Practice Bitcoin Trading Simulator */}
      <section id="market-simulator" className="container mx-auto px-4 py-8">
        <ProgressiveLoader 
          skeletonType="chart" 
          count={1}
          isLoading={false}
          delay={1000}
        >
          <LazyMarketSimulatorWrapper />
        </ProgressiveLoader>
      </section>
    </div>
  );
}