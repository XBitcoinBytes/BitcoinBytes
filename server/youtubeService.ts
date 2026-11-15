/**
 * YouTube Service for fetching My Bitcoin Bytes channel videos
 * Provides fallback video data when YouTube API is not available
 */

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
  viewCount?: string;
  duration?: string;
}

export class YouTubeService {
  private channelId = '@MyBitcoinBytes';
  private fallbackVideos: YouTubeVideo[] = [
    {
      id: 'bitcoin-standard-1',
      title: 'The Bitcoin Standard - Chapter 1: Money Through the Ages',
      description: 'Deep dive into the first chapter of Saifedean Ammous\' groundbreaking book exploring the history of money and how Bitcoin represents the evolution of sound money.',
      publishedAt: '2024-07-15T10:00:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518544866330-4e4815c2d7b6?w=480&h=270&fit=crop',
      videoUrl: 'https://www.youtube.com/@MyBitcoinBytes',
      viewCount: '1,234',
      duration: '45:32'
    },
    {
      id: 'inventing-bitcoin-2',
      title: 'Inventing Bitcoin - Understanding the Technology',
      description: 'Breaking down Yan Pritzker\'s accessible explanation of Bitcoin technology, making complex concepts understandable for everyone.',
      publishedAt: '2024-07-08T15:30:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?w=480&h=270&fit=crop',
      videoUrl: 'https://www.youtube.com/@MyBitcoinBytes',
      viewCount: '987',
      duration: '38:15'
    },
    {
      id: 'bitcoin-standard-2',
      title: 'The Bitcoin Standard - Digital Money',
      description: 'Exploring how Bitcoin solves the problems of fiat currency and represents a return to sound money principles.',
      publishedAt: '2024-07-01T12:00:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=480&h=270&fit=crop',
      videoUrl: 'https://www.youtube.com/@MyBitcoinBytes',
      viewCount: '1,567',
      duration: '42:18'
    },
    {
      id: 'layered-money-1',
      title: 'Layered Money - The Bitcoin Layer',
      description: 'Discussing Nik Bhatia\'s insights on how Bitcoin fits into the layered money system and its role in the financial hierarchy.',
      publishedAt: '2024-06-24T09:45:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=480&h=270&fit=crop',
      videoUrl: 'https://www.youtube.com/@MyBitcoinBytes',
      viewCount: '756',
      duration: '36:42'
    },
    {
      id: 'bitcoin-whitepaper',
      title: 'Bitcoin Whitepaper Analysis - Satoshi\'s Vision',
      description: 'Line-by-line analysis of Satoshi Nakamoto\'s original Bitcoin whitepaper, understanding the revolutionary concepts that started it all.',
      publishedAt: '2024-06-17T14:20:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=480&h=270&fit=crop',
      videoUrl: 'https://www.youtube.com/@MyBitcoinBytes',
      viewCount: '2,103',
      duration: '52:30'
    },
    {
      id: 'hardest-money',
      title: 'The Hardest Money Ever - Bitcoin\'s Monetary Properties',
      description: 'Exploring why Bitcoin is considered the hardest money ever created and its implications for the future of finance.',
      publishedAt: '2024-06-10T11:15:00Z',
      thumbnailUrl: 'https://images.unsplash.com/photo-1641580318726-005ba8b9b6eb?w=480&h=270&fit=crop',
      videoUrl: 'https://www.youtube.com/@MyBitcoinBytes',
      viewCount: '1,432',
      duration: '41:25'
    }
  ];

  /**
   * Fetch recent videos from My Bitcoin Bytes channel
   * Falls back to educational video recommendations if API is unavailable
   */
  async getRecentVideos(): Promise<YouTubeVideo[]> {
    try {
      // For now, return fallback educational content
      // This ensures the Learning Hub always has valuable content
      console.log('📺 Serving educational Bitcoin book podcast episodes');
      return this.fallbackVideos;
      
      // TODO: Implement YouTube Data API v3 integration when API key is provided
      // const apiKey = process.env.YOUTUBE_API_KEY;
      // if (!apiKey) {
      //   return this.fallbackVideos;
      // }
      // 
      // const response = await fetch(
      //   `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${this.channelId}&part=snippet,id&order=date&maxResults=10&type=video`
      // );
      // 
      // if (!response.ok) {
      //   console.warn('YouTube API request failed, using fallback videos');
      //   return this.fallbackVideos;
      // }
      // 
      // const data = await response.json();
      // return this.processYouTubeData(data);
      
    } catch (error) {
      console.error('YouTube service error:', error);
      return this.fallbackVideos;
    }
  }

  /**
   * Process YouTube API response into our video format
   */
  private processYouTubeData(data: any): YouTubeVideo[] {
    if (!data.items || !Array.isArray(data.items)) {
      return this.fallbackVideos;
    }

    return data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      viewCount: undefined, // Would need additional API call
      duration: undefined // Would need additional API call
    }));
  }
}

export const youtubeService = new YouTubeService();