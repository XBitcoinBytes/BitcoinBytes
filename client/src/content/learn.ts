/**
 * Educational content for /learn. Neutral, factual explanations only:
 * no price forecasts or targets, buy/sell signals or investment recommendations.
 */
export type Level = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Concept {
  id: string;
  title: string;
  level: Level;
  readTime: string;
  summary: string;
  explanation: string;
  keyPoints: string[];
  example: string;
  /** A real BitcoinBytes episode on the topic (id + title from the channel feed). */
  relatedEpisode?: { videoId: string; title: string };
}

export const CONCEPTS: Concept[] = [
  {
    id: 'what-is-bitcoin',
    title: 'What Bitcoin is',
    level: 'Beginner',
    readTime: '3 min',
    summary: 'A digital currency whose ledger is kept by a public network instead of a bank.',
    explanation:
      'Bitcoin is a digital currency launched in 2009. Ownership is recorded on a public ledger, the blockchain, which thousands of independent computers (nodes) keep in sync. No company or government runs the ledger; the software rules every node enforces decide which transactions are valid.',
    keyPoints: [
      'Balances are recorded on a public, append-only ledger',
      'Anyone can run a node and verify the full history',
      'Transactions are authorised with private keys, not account passwords',
      'Bitcoin can be divided into 100,000,000 units called satoshis',
    ],
    example:
      'When you send bitcoin, your wallet signs a message with your private key. Nodes check the signature and that the coins are unspent, then a miner includes the transaction in a block.',
  },
  {
    id: 'supply',
    title: 'Fixed supply and halvings',
    level: 'Beginner',
    readTime: '3 min',
    summary: 'New bitcoin is issued on a fixed schedule that approaches 21 million coins.',
    explanation:
      'New bitcoin enters circulation as a reward to miners. That reward halves roughly every four years (every 210,000 blocks), so issuance slows over time and total supply approaches, but never exceeds, 21 million. Changing this rule would require the network’s users to adopt incompatible software, which is why it is considered very hard to change.',
    keyPoints: [
      'Maximum supply is just under 21 million BTC',
      'The block reward halves about every four years',
      'The last new bitcoin is expected to be issued around the year 2140',
      'A fixed schedule does not mean a stable price; bitcoin’s price is volatile',
    ],
    example:
      'The block reward started at 50 BTC in 2009 and has halved several times since. Each halving cuts new issuance in half overnight.',
    relatedEpisode: { videoId: 'xwMvHVfykms', title: 'Episode 15: “Everything Divided by 21 Million”' },
  },
  {
    id: 'mining',
    title: 'Mining and proof-of-work',
    level: 'Intermediate',
    readTime: '4 min',
    summary: 'Miners spend computing power to add blocks, which makes rewriting history expensive.',
    explanation:
      'Miners bundle pending transactions into a block and repeatedly hash it until they find a result below a target set by the network’s difficulty. Finding one takes enormous computation, but checking it is instant. To rewrite past transactions, an attacker would have to redo that work faster than the rest of the network combined.',
    keyPoints: [
      'A new block is found about every 10 minutes on average',
      'Difficulty adjusts every 2,016 blocks to keep that pace',
      'Miners earn the block reward plus transaction fees',
      'Mining uses significant electricity, which is an ongoing public debate',
    ],
    example:
      'If more miners join, blocks briefly arrive faster; at the next difficulty adjustment the target gets harder and the average returns to about 10 minutes.',
    relatedEpisode: { videoId: '00SG-dICGY0', title: 'Episode 14: “Softwar”' },
  },
  {
    id: 'keys-and-wallets',
    title: 'Keys, wallets and seed phrases',
    level: 'Beginner',
    readTime: '4 min',
    summary: 'Whoever controls the private keys controls the bitcoin.',
    explanation:
      'A wallet doesn’t store coins; it stores the keys that can spend coins recorded on the blockchain. Most wallets back up those keys as a 12 or 24 word seed phrase. Anyone who learns the seed phrase can take the funds, and if it is lost there is no password reset.',
    keyPoints: [
      'Custodial: an exchange holds the keys for you',
      'Self-custody: you hold the keys in a software or hardware wallet',
      'Write the seed phrase down offline and never share it',
      'Legitimate support staff will never ask for your seed phrase',
    ],
    example:
      'If an exchange freezes withdrawals, customers who left coins there have to wait. Coins in a wallet whose keys you control can be moved at any time.',
  },
  {
    id: 'transactions-fees',
    title: 'Transactions and network fees',
    level: 'Intermediate',
    readTime: '3 min',
    summary: 'Block space is limited, so transactions bid for it with fees.',
    explanation:
      'Each block has limited space. When many people want to transact, users attach higher fees so miners include them sooner. Network fees are separate from the trading fees and spreads an exchange charges when you buy.',
    keyPoints: [
      'Fees are priced per unit of transaction size, not per dollar sent',
      'Fees rise when the network is busy and fall when it is quiet',
      'Confirmations measure how many blocks are built on top of yours',
      'Exchange withdrawal fees may differ from the actual network fee',
    ],
    example:
      'Sending $20 or $20,000 of bitcoin in a similarly sized transaction costs about the same network fee.',
    relatedEpisode: { videoId: 'ZHiGPr2Pj84', title: 'Episode 21: “The Blocksize War”' },
  },
  {
    id: 'lightning',
    title: 'The Lightning Network',
    level: 'Advanced',
    readTime: '4 min',
    summary: 'A payment layer built on Bitcoin for fast, low-cost transfers.',
    explanation:
      'Lightning lets two parties open a payment channel backed by an on-chain transaction, then exchange many off-chain payments instantly. Channels link into a network so payments can route between people without a direct channel. Only opening and closing channels touches the blockchain.',
    keyPoints: [
      'Payments settle in seconds with very small fees',
      'Best suited to smaller, frequent payments',
      'Requires an online wallet or a Lightning service provider',
      'Trade-offs include liquidity management and more complex software',
    ],
    example:
      'A coffee shop can accept a Lightning payment that confirms almost instantly, instead of waiting for an on-chain confirmation.',
    relatedEpisode: { videoId: '6mLZ_zJIRYk', title: 'Episode 20: “Mastering the Lightning Network”' },
  },
];

export type GlossaryGroup = 'Buying and fees' | 'How the network works' | 'Keys and storage';

/** `id` is the #anchor on /learn (e.g. bitcoinbytes.org/learn#difficulty-adjustment). Keep ids stable. */
export interface GlossaryEntry { id: string; term: string; group: GlossaryGroup; definition: string }

export const GLOSSARY_GROUPS: GlossaryGroup[] = ['Buying and fees', 'How the network works', 'Keys and storage'];

export const GLOSSARY: GlossaryEntry[] = [
  // Buying and fees
  { id: 'ask', group: 'Buying and fees', term: 'Ask', definition: 'The lowest price a seller on an exchange is currently willing to accept. A market buy pays the ask.' },
  { id: 'bid', group: 'Buying and fees', term: 'Bid', definition: 'The highest price a buyer on an exchange is currently willing to pay. A market sell receives the bid.' },
  { id: 'order-book', group: 'Buying and fees', term: 'Order book', definition: 'The live list of buy (bid) and sell (ask) orders on an exchange. Our comparison walks it to estimate what a purchase really costs.' },
  { id: 'spread', group: 'Buying and fees', term: 'Spread', definition: 'The gap between the best bid and the best ask. Some apps also add a markup to the price instead of, or on top of, a stated fee.' },
  { id: 'taker-fee', group: 'Buying and fees', term: 'Taker fee', definition: 'The fee an exchange charges when your order fills immediately against existing orders, as a market buy does.' },
  { id: 'maker-fee', group: 'Buying and fees', term: 'Maker fee', definition: 'The fee an exchange charges when your order waits on the order book and is filled later by someone else. It is usually lower than the taker fee.' },
  { id: 'slippage', group: 'Buying and fees', term: 'Slippage', definition: 'The extra cost when a large order uses up the best-priced orders and fills at worse prices further down the book.' },
  { id: 'kyc', group: 'Buying and fees', term: 'KYC', definition: '“Know your customer”: identity checks US exchanges are required to perform before you can buy.' },
  { id: 'satoshi', group: 'Buying and fees', term: 'Satoshi (sat)', definition: 'The smallest unit of bitcoin: 0.00000001 BTC. One bitcoin is 100 million sats, so you can buy a small fraction.' },
  // How the network works
  { id: 'blockchain', group: 'How the network works', term: 'Blockchain', definition: 'Bitcoin’s shared record of every transaction, grouped into blocks that are chained together in order. Thousands of independent computers keep a copy.' },
  { id: 'block', group: 'How the network works', term: 'Block', definition: 'A batch of confirmed transactions added to the blockchain. The network is tuned so a new block is found about every 10 minutes on average.' },
  { id: 'block-height', group: 'How the network works', term: 'Block height', definition: 'A block’s position in the chain, counting from the first (“genesis”) block at height 0. The current height is shown in “Network right now” above.' },
  { id: 'confirmation', group: 'How the network works', term: 'Confirmation', definition: 'A transaction gets its first confirmation when it is included in a block. Each later block adds one more, making it harder to reverse.' },
  { id: 'mempool', group: 'How the network works', term: 'Mempool', definition: 'The waiting area for valid transactions that are not yet in a block. Each node keeps its own copy.' },
  { id: 'network-fee', group: 'How the network works', term: 'Network fee', definition: 'The fee a sender pays miners to include a transaction in a block, usually quoted in sats per virtual byte. It is separate from any exchange fee.' },
  { id: 'proof-of-work', group: 'How the network works', term: 'Mining (proof of work)', definition: 'Computers race to find a block by repeating a calculation until one meets the network’s target. The winner adds the block and earns new bitcoin plus the transaction fees.' },
  { id: 'hash-rate', group: 'How the network works', term: 'Hash rate', definition: 'The total computing power miners put toward finding blocks, measured in hashes per second.' },
  { id: 'difficulty-adjustment', group: 'How the network works', term: 'Difficulty adjustment', definition: 'Every 2,016 blocks (about two weeks), the network resets how hard it is to find a block, so blocks keep arriving about every 10 minutes as miners join or leave.' },
  { id: 'halving', group: 'How the network works', term: 'Halving', definition: 'Every 210,000 blocks (about four years), the new bitcoin paid per block is cut in half. Since the April 2024 halving it is 3.125 BTC.' },
  { id: 'supply-cap', group: 'How the network works', term: '21 million cap', definition: 'The issuance schedule means there will never be more than about 21 million bitcoin. The last new bitcoin is expected to be mined around the year 2140.' },
  { id: 'node', group: 'How the network works', term: 'Node', definition: 'A computer running Bitcoin software that checks every block and transaction against the rules and keeps its own copy of the blockchain.' },
  { id: 'lightning-network', group: 'How the network works', term: 'Lightning Network', definition: 'A layer built on top of Bitcoin for fast, low-fee payments through payment channels, which settle back to the main chain when closed.' },
  // Keys and storage
  { id: 'wallet', group: 'Keys and storage', term: 'Wallet', definition: 'An app or device that holds your keys and lets you send and receive bitcoin. The coins themselves are recorded on the blockchain, not inside the wallet.' },
  { id: 'private-key', group: 'Keys and storage', term: 'Private key', definition: 'The secret number that lets you spend bitcoin. Anyone who has it can move the coins, so it is never shared.' },
  { id: 'seed-phrase', group: 'Keys and storage', term: 'Seed phrase', definition: 'A list of 12 or 24 words that backs up a wallet’s keys. Anyone with the words can take the bitcoin, so never type them into a website or share them.' },
  { id: 'self-custody', group: 'Keys and storage', term: 'Self-custody', definition: 'Holding your own keys instead of leaving bitcoin with an exchange or app. You control the coins, and you are responsible for the backup.' },
  { id: 'cold-storage', group: 'Keys and storage', term: 'Cold storage', definition: 'Keeping private keys on a device that is never connected to the internet.' },
];

export interface Resource { title: string; author: string; url: string; note: string }

export const RESOURCES: Resource[] = [
  { title: 'Bitcoin: A Peer-to-Peer Electronic Cash System', author: 'Satoshi Nakamoto (2008)', url: 'https://bitcoin.org/bitcoin.pdf', note: 'The original nine-page whitepaper.' },
  { title: 'Bitcoin.org: Getting started', author: 'Bitcoin.org', url: 'https://bitcoin.org/en/getting-started', note: 'Community-maintained introduction and wallet guide.' },
  { title: 'Mastering Bitcoin', author: 'Andreas M. Antonopoulos & David A. Harding', url: 'https://github.com/bitcoinbook/bitcoinbook', note: 'Free, open-source technical book.' },
  { title: 'Learn Me a Bitcoin', author: 'Greg Walker', url: 'https://learnmeabitcoin.com/', note: 'Visual, beginner-friendly technical explanations.' },
  { title: 'Investor alerts on crypto assets', author: 'U.S. SEC / Investor.gov', url: 'https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-alerts/investor-alert-0', note: 'Official guidance on scams and risks.' },
];
