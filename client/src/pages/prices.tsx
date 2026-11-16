import { useQuery } from '@tanstack/react-query';
import { useBitcoinPrice } from '@/hooks/use-bitcoin-price';
import { usePageMeta } from '@/hooks/usePageMeta';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function PricesPage() {
  usePageMeta({ title: 'Bitcoin Prices — BitcoinBytes', description: 'Bitcoin USD quotes fetched from public exchange feeds.', canonical: '/prices' });
  const { data, isLoading, error, refetch } = useBitcoinPrice();
  const history = useQuery<Array<{ timestamp: string; price: number }>>({
    queryKey: ['/api/charts/bitcoin-history'], refetchInterval: 60000, retry: false
  });
  return <div className="min-h-screen bg-[#0a0a12] text-white">
    <Header />
    <main id="main-content" className="max-w-4xl mx-auto px-6 pt-28 pb-16">
      <h1 className="text-3xl font-bold mb-4">Bitcoin USD prices</h1>
      <p className="text-gray-300 mb-6">Public exchange spot quotes, refreshed every 30 seconds with a server cache of up to 45 seconds. Quotes exclude fees and are not guaranteed purchase prices.</p>
      <button className="underline mb-6" onClick={() => refetch()}>Refresh prices</button>
      {isLoading ? <p role="status">Loading prices…</p> : error || !data ? <p role="status">Price unavailable. Please try again later.</p> :
        <ul className="space-y-4">{data.exchanges.map(({ exchange, currentPrice }) =>
          <li key={exchange.id} className="border border-gray-700 rounded p-4">
            <h2 className="text-xl">{exchange.displayName}</h2>
            <p className="text-2xl">{Number(currentPrice.price).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            <p className="text-gray-300">Fetched <time dateTime={String(currentPrice.timestamp)}>{new Date(currentPrice.timestamp).toLocaleTimeString()}</time></p>
          </li>)}</ul>}
      <h2 className="text-2xl mt-10 mb-4">Recent daily prices</h2>
      {history.isLoading ? <p role="status">Loading history…</p> : history.error || !history.data?.length ? <p role="status">Price history unavailable.</p> :
        <table className="w-full text-left"><caption className="text-gray-300 mb-3">CoinGecko historical USD prices</caption><thead><tr><th scope="col">Date</th><th scope="col">Price</th></tr></thead>
          <tbody>{history.data.slice(-8).map(point => <tr key={point.timestamp}><th scope="row" className="font-normal py-2">{new Date(point.timestamp).toLocaleDateString()}</th><td>{point.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>)}</tbody></table>}
    </main><Footer />
  </div>;
}
